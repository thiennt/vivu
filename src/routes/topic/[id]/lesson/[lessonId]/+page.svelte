<script>
	import { onMount } from 'svelte';
	
	let { data } = $props();
	let topic = $derived(data.topic);
	let lesson = $derived(data.lesson);
	
	// State variables
	let showLesson = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let audio = $state(null);
	let isLoadingAudio = $state(false);
	let playingWordIndex = $state(null);
	
	// Cache key for lesson audio
	const lessonAudioKey = `lesson_audio_${lesson.id}`;
	
	// State for error messages
	let errorMessage = $state(null);
	
	// Helper function to cancel speech synthesis
	function cancelSpeechSynthesis() {
		if (window.speechSynthesis && window.speechSynthesis.speaking) {
			window.speechSynthesis.cancel();
		}
	}
	
	// Initialize audio element
	onMount(() => {
		audio = new Audio();
		audio.addEventListener('loadedmetadata', () => {
			duration = audio.duration;
		});
		audio.addEventListener('timeupdate', () => {
			currentTime = audio.currentTime;
		});
		audio.addEventListener('ended', () => {
			isPlaying = false;
		});
		
		return () => {
			if (audio) {
				audio.pause();
				audio.src = '';
			}
		};
	});
	
	// Toggle lesson visibility
	function toggleLesson() {
		showLesson = !showLesson;
	}
	
	// Play or pause lesson audio
	async function toggleAudio() {
		if (!audio) return;
		
		if (isPlaying) {
			// If using browser TTS, cancel it
			cancelSpeechSynthesis();
			audio.pause();
			isPlaying = false;
		} else {
			// Check cache first
			const cachedAudio = localStorage.getItem(lessonAudioKey);
			
			if (cachedAudio && cachedAudio !== 'BROWSER_TTS_PLAYED') {
				audio.src = cachedAudio;
				await audio.play();
				isPlaying = true;
			} else {
				// Generate audio from API (will use browser TTS or Gemini)
				await generateLessonAudio();
			}
		}
	}
	
	// Generate lesson audio using Gemini API
	async function generateLessonAudio() {
		isLoadingAudio = true;
		try {
			const text = lesson.vocabulary.map(v => v.word).join(', ');
			const response = await fetch('/api/generate-audio', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text, lessonId: lesson.id })
			});
			
			if (!response.ok) {
				throw new Error('Failed to generate audio');
			}
			
			const { audioData, text: responseText } = await response.json();
			
			// Check if we need to use browser TTS
			if (audioData === 'USE_BROWSER_TTS') {
				await generateBrowserTTS(responseText || text);
			} else {
				// Cache the audio
				localStorage.setItem(lessonAudioKey, audioData);
				
				// Play the audio
				audio.src = audioData;
				await audio.play();
				isPlaying = true;
			}
		} catch (error) {
			console.error('Error generating audio:', error);
			errorMessage = 'Failed to generate audio. Please try again.';
			setTimeout(() => errorMessage = null, 3000);
		} finally {
			isLoadingAudio = false;
		}
	}
	
	// Generate audio using browser's speech synthesis
	async function generateBrowserTTS(text) {
		return new Promise((resolve, reject) => {
			if (!('speechSynthesis' in window)) {
				reject(new Error('Browser does not support text-to-speech'));
				return;
			}
			
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = 'en-US';
			utterance.rate = 0.9;
			
			utterance.onend = () => {
				isPlaying = false;
				resolve();
			};
			
			utterance.onerror = (error) => {
				isPlaying = false;
				reject(error);
			};
			
			window.speechSynthesis.speak(utterance);
			isPlaying = true;
			
			// Note: Browser TTS doesn't provide audio data for caching
			// We'll just mark it as played
			localStorage.setItem(lessonAudioKey, 'BROWSER_TTS_PLAYED');
		});
	}
	
	// Seek to a specific time in the audio
	function seekAudio(event) {
		if (!audio || !duration) return;
		
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const percentage = x / rect.width;
		const newTime = percentage * duration;
		
		audio.currentTime = newTime;
		currentTime = newTime;
	}
	
	// Handle keyboard navigation for progress bar
	function handleProgressKeydown(event) {
		if (!audio || !duration) return;
		
		const step = duration * 0.05; // 5% of duration
		
		switch(event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				audio.currentTime = Math.max(0, currentTime - step);
				break;
			case 'ArrowRight':
				event.preventDefault();
				audio.currentTime = Math.min(duration, currentTime + step);
				break;
			case 'Home':
				event.preventDefault();
				audio.currentTime = 0;
				break;
			case 'End':
				event.preventDefault();
				audio.currentTime = duration;
				break;
		}
	}
	
	// Play individual word pronunciation
	async function playWord(vocab, index) {
		playingWordIndex = index;
		
		// Use browser's speech synthesis for word pronunciation
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(vocab.word);
			utterance.lang = 'en-US';
			utterance.rate = 0.8;
			
			utterance.onend = () => {
				playingWordIndex = null;
			};
			
			utterance.onerror = () => {
				playingWordIndex = null;
			};
			
			window.speechSynthesis.speak(utterance);
		} else {
			// Fallback to API if browser doesn't support speech synthesis
			const wordAudioKey = `word_audio_${vocab.word.toLowerCase().replace(/\s+/g, '_')}`;
			let cachedWordAudio = localStorage.getItem(wordAudioKey);
			
			if (!cachedWordAudio) {
				// Generate word audio
				try {
					const response = await fetch('/api/generate-audio', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ text: vocab.word, lessonId: lesson.id, isWord: true })
					});
					
					if (!response.ok) {
						throw new Error('Failed to generate word audio');
					}
					
					const { audioData } = await response.json();
					if (audioData !== 'USE_BROWSER_TTS') {
						cachedWordAudio = audioData;
						localStorage.setItem(wordAudioKey, audioData);
					}
				} catch (error) {
					console.error('Error generating word audio:', error);
					playingWordIndex = null;
					return;
				}
			}
			
			if (cachedWordAudio && cachedWordAudio !== 'USE_BROWSER_TTS') {
				// Play word audio
				const wordAudio = new Audio(cachedWordAudio);
				wordAudio.addEventListener('ended', () => {
					playingWordIndex = null;
				});
				await wordAudio.play();
			} else {
				playingWordIndex = null;
			}
		}
	}
	
	// Format time for display
	function formatTime(seconds) {
		if (!seconds || isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">← Home</a>
		<span class="separator">/</span>
		<a href="/topic/{topic.id}">← {topic.title}</a>
	</nav>

	<!-- Error message display -->
	{#if errorMessage}
		<div class="error-message">
			{errorMessage}
		</div>
	{/if}

	<div class="lesson-header">
		<div class="header-content">
			<h1>{lesson.title}</h1>
			<p class="description">{lesson.content}</p>
		</div>
		
		<!-- Voice icon - always visible -->
		<button class="voice-icon" onclick={toggleAudio} disabled={isLoadingAudio}>
			{#if isLoadingAudio}
				<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" opacity="0.25"/>
					<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 12 12"
							to="360 12 12"
							dur="1s"
							repeatCount="indefinite"
						/>
					</path>
				</svg>
			{:else if isPlaying}
				<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
					<rect x="6" y="4" width="4" height="16" rx="1"/>
					<rect x="14" y="4" width="4" height="16" rx="1"/>
				</svg>
			{:else}
				<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
					<path d="M8 5v14l11-7z"/>
				</svg>
			{/if}
		</button>
	</div>

	<!-- Audio player controls -->
	{#if audio && duration > 0}
		<div class="audio-player">
			<div class="time-display">{formatTime(currentTime)}</div>
			<button 
				class="progress-bar" 
				onclick={seekAudio}
				onkeydown={handleProgressKeydown}
				aria-label="Seek audio"
				role="slider"
				aria-valuemin="0"
				aria-valuemax={duration}
				aria-valuenow={currentTime}
			>
				<div class="progress-fill" style="width: {(currentTime / duration) * 100}%"></div>
			</button>
			<div class="time-display">{formatTime(duration)}</div>
		</div>
	{/if}

	<!-- Show/Hide lesson button -->
	<div class="lesson-controls">
		<button class="toggle-lesson-btn" onclick={toggleLesson}>
			{showLesson ? 'Hide Lesson' : 'Show Lesson'}
		</button>
	</div>

	<!-- Lesson content (collapsible) -->
	{#if showLesson}
		<div class="lesson-content">
			<!-- Vietnamese translation -->
			<div class="translation-section">
				<h3>Bản dịch (Translation)</h3>
				<p class="translation">{lesson.translation}</p>
			</div>

			<!-- Vocabulary with IPA -->
			<div class="vocabulary-section">
				<h3>Vocabulary</h3>
				<div class="vocabulary-grid">
					{#each lesson.vocabulary as vocab, index}
						<button 
							class="vocab-card" 
							class:playing={playingWordIndex === index}
							onclick={() => playWord(vocab, index)}
						>
							<div class="vocab-word">{vocab.word}</div>
							<div class="vocab-ipa">{vocab.ipa}</div>
							<div class="vocab-meaning">{vocab.meaning}</div>
							<div class="play-indicator">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8 5v14l11-7z"/>
								</svg>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.breadcrumb {
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.breadcrumb a {
		color: white;
		text-decoration: none;
		font-size: 1rem;
		opacity: 0.9;
		transition: opacity 0.2s;
	}

	.breadcrumb a:hover {
		opacity: 1;
	}

	.separator {
		color: white;
		opacity: 0.7;
	}

	.error-message {
		background: #ff4444;
		color: white;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center;
		font-weight: 500;
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.lesson-header {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.header-content {
		flex: 1;
	}

	.lesson-header h1 {
		margin: 0 0 1rem 0;
		color: #667eea;
		font-size: 2rem;
	}

	.description {
		color: #555;
		font-size: 1.1rem;
		line-height: 1.6;
		margin: 0;
	}

	.voice-icon {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: white;
		transition: all 0.3s;
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
		flex-shrink: 0;
	}

	.voice-icon:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
	}

	.voice-icon:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.audio-player {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.time-display {
		color: #667eea;
		font-weight: 600;
		font-size: 0.9rem;
		min-width: 45px;
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: #e0e0e0;
		border-radius: 4px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		border: none;
		padding: 0;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 4px;
		transition: width 0.1s linear;
	}

	.lesson-controls {
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.toggle-lesson-btn {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		padding: 0.75rem 2rem;
		border-radius: 25px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-lesson-btn:hover {
		background: #667eea;
		color: white;
	}

	.lesson-content {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.translation-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #f0f0f0;
	}

	.translation-section h3 {
		color: #667eea;
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
	}

	.translation {
		color: #555;
		font-size: 1.1rem;
		line-height: 1.6;
		margin: 0;
		font-style: italic;
	}

	.vocabulary-section h3 {
		color: #667eea;
		margin: 0 0 1.5rem 0;
		font-size: 1.3rem;
	}

	.vocabulary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}

	.vocab-card {
		background: #f8f9ff;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		position: relative;
		overflow: hidden;
	}

	.vocab-card:hover {
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
	}

	.vocab-card.playing {
		border-color: #764ba2;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
	}

	.vocab-word {
		font-size: 1.2rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.vocab-ipa {
		font-size: 0.95rem;
		color: #667eea;
		font-family: 'Courier New', monospace;
		margin-bottom: 0.5rem;
	}

	.vocab-meaning {
		font-size: 0.9rem;
		color: #666;
	}

	.play-indicator {
		position: absolute;
		top: 1rem;
		right: 1rem;
		color: #667eea;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.vocab-card:hover .play-indicator,
	.vocab-card.playing .play-indicator {
		opacity: 1;
	}

	@media (max-width: 768px) {
		.lesson-header {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.lesson-header h1 {
			font-size: 1.5rem;
		}

		.voice-icon {
			width: 70px;
			height: 70px;
		}

		.vocabulary-grid {
			grid-template-columns: 1fr;
		}

		.audio-player {
			padding: 1rem;
		}
	}
</style>
