<script>
	import { onMount } from 'svelte';
	import { generateSpeech } from '$lib/tts-client.js';
	
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
	
	// State for error messages
	let errorMessage = $state(null);
	
	// Initialize audio element
	onMount(async () => {
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
			audio.pause();
			isPlaying = false;
		} else {
			await generateLessonAudio();
		}
	}
	
	// Generate lesson audio using backend API
	async function generateLessonAudio() {
		isLoadingAudio = true;
		try {
			const audioUrl = await generateSpeech(topic.id, lesson.id);

			console.log('Generated audio URL:', audioUrl);

			if (!audioUrl) {
				throw new Error('Failed to generate audio');
			}

			// Set audio type for .wav
			audio.src = '';
			audio.load();
			audio.src = audioUrl;
			audio.type = 'audio/wav';
			audio.load();
			await audio.play();
			isPlaying = true;
		} catch (error) {
			console.error('Error generating audio:', error);
			errorMessage = 'Failed to generate audio. Please try again.';
			setTimeout(() => errorMessage = null, 3000);
		} finally {
			isLoadingAudio = false;
		}
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

		try {
			const audioUrl = await generateSpeech(topic.id, lesson.id, index);

			if (!audioUrl) {
				throw new Error('Failed to generate word audio');
			}

			// Play word audio with type set
			const wordAudio = new Audio();
			wordAudio.src = '';
			wordAudio.load();
			wordAudio.src = audioUrl;
			wordAudio.type = 'audio/wav';
			wordAudio.load();
			wordAudio.addEventListener('ended', () => {
				playingWordIndex = null;
			});
			wordAudio.addEventListener('error', () => {
				playingWordIndex = null;
			});
			await wordAudio.play();
		} catch (error) {
			console.error('Error generating word audio:', error);
			playingWordIndex = null;
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
		<h1>{lesson.title}</h1>
		
		<!-- Voice icon - next to title -->
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
			<!-- Lesson story content -->
			<div class="story-section">
				<h3>Story</h3>
				<p class="story-text">{lesson.content}</p>
			</div>

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
		gap: 1.5rem;
	}

	.lesson-header h1 {
		margin: 0;
		color: #667eea;
		font-size: 2rem;
		flex: 1;
	}

	.voice-icon {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		width: 60px;
		height: 60px;
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

	.story-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #f0f0f0;
	}

	.story-section h3 {
		color: #667eea;
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
	}

	.story-text {
		color: #333;
		font-size: 1.1rem;
		line-height: 1.8;
		margin: 0;
		text-align: justify;
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
