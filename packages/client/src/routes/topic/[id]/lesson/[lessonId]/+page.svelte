<script>
	import { onMount } from 'svelte';
	import { generateSpeech, getCurrentProvider, setProvider } from '$lib/tts-client.js';
	import { getProviders, RECOMMENDED_ENGLISH_VOICE, VOICE_OPTIONS } from '$lib/tts-providers.js';
	
	let { data } = $props();
	let topic = $derived(data.topic);
	let lesson = $derived(data.lesson);

	let qaPairs = $derived(
		(lesson?.questions ?? [])
			.map((qa) => ({
				q: (qa?.q ?? qa?.question ?? '').trim(),
				a: (qa?.a ?? qa?.answer ?? '').trim()
			}))
			.filter((qa) => qa.q && qa.a)
	);
	
	// State variables
	let showLesson = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let audio = $state(null);
	let isLoadingAudio = $state(false);
	
	// TTS Provider state
	let selectedProvider = $state(getCurrentProvider());
	let providers = getProviders();
	
	// Playback speed state
	let playbackSpeed = $state(1.0);
	let speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
	
	// Volume state
	let volume = $state(1.0);
	
	// Voice selection state
	let selectedVoice = $state(RECOMMENDED_ENGLISH_VOICE);
	let voiceOptions = VOICE_OPTIONS;
	
	// State for error messages
	let errorMessage = $state(null);
	
	// Dictionary popup state
	let showDictionary = $state(false);
	let selectedWord = $state('');
	let dictionaryData = $state(null);
	let isLoadingDictionary = $state(false);
	let dictionaryError = $state(null);
	
	// Progress bar drag state
	let isDragging = $state(false);
	let progressBarRect = null; // Non-reactive reference to avoid memory leaks
	
	// Track object URLs for cleanup
	let currentObjectUrl = null;
	
	const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
	
	// Initialize audio element
	onMount(async () => {
		audio = new Audio();
		audio.addEventListener('loadedmetadata', () => {
			duration = audio.duration;
			audio.playbackRate = playbackSpeed;
		});
		audio.addEventListener('timeupdate', () => {
			currentTime = audio.currentTime;
		});
		audio.addEventListener('ended', () => {
			isPlaying = false;
		});
		
		// Add global mouse event listeners for dragging
		const handleGlobalMouseMove = (event) => {
			if (isDragging) {
				handleProgressMouseMove(event);
			}
		};
		
		const handleGlobalMouseUp = () => {
			if (isDragging) {
				handleProgressMouseUp();
			}
		};
		
		window.addEventListener('mousemove', handleGlobalMouseMove);
		window.addEventListener('mouseup', handleGlobalMouseUp);
		
		return () => {
			if (audio) {
				audio.pause();
				// Revoke object URL if it exists
				if (currentObjectUrl && currentObjectUrl.startsWith('blob:')) {
					URL.revokeObjectURL(currentObjectUrl);
				}
				audio.src = '';
			}
			window.removeEventListener('mousemove', handleGlobalMouseMove);
			window.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	});
	
	// Toggle lesson visibility
	function toggleLesson() {
		showLesson = !showLesson;
	}
	
	// Clear audio source to force regeneration
	function clearAudioSource() {
		if (audio) {
			audio.pause();
			// Revoke object URL if it exists (for Puter.js generated blobs)
			if (currentObjectUrl && currentObjectUrl.startsWith('blob:')) {
				URL.revokeObjectURL(currentObjectUrl);
			}
			audio.src = '';
			currentObjectUrl = null;
			isPlaying = false;
			currentTime = 0;
			duration = 0;
		}
	}
	
	// Handle provider change
	function handleProviderChange(event) {
		const newProvider = event.target.value;
		setProvider(newProvider);
		selectedProvider = newProvider;
		clearAudioSource();
	}
	
	// Handle playback speed change
	function handleSpeedChange(event) {
		const newSpeed = parseFloat(event.target.value);
		playbackSpeed = newSpeed;
		if (audio) {
			audio.playbackRate = newSpeed;
		}
	}
	
	// Handle volume change
	function handleVolumeChange(event) {
		const newVolume = parseFloat(event.target.value);
		volume = newVolume;
		if (audio) {
			audio.volume = newVolume;
		}
	}
	
	// Handle voice change
	async function handleVoiceChange(event) {
		const hadAudio = !!audio.src;
		
		selectedVoice = event.target.value;
		clearAudioSource();
		
		// If audio was loaded, regenerate with new voice
		if (hadAudio) {
			await generateLessonAudio();
			// generateLessonAudio() automatically plays the audio after generation
		}
	}
	
	// Helper function to set playback rate when audio metadata loads
	function applyPlaybackRate(audioElement) {
		const setPlaybackRate = () => {
			audioElement.playbackRate = playbackSpeed;
			audioElement.removeEventListener('loadedmetadata', setPlaybackRate);
		};
		audioElement.addEventListener('loadedmetadata', setPlaybackRate);
	}
	
	// Play or pause lesson audio
	async function toggleAudio() {
		if (!audio) return;
		
		if (isPlaying) {
			audio.pause();
			isPlaying = false;
		} else {
			// If audio is already loaded, just resume playback
			if (audio.src) {
				try {
					await audio.play();
					isPlaying = true;
				} catch (error) {
					console.error('Error playing audio:', error);
					errorMessage = 'Failed to play audio. Please try again.';
					setTimeout(() => errorMessage = null, 3000);
				}
			} else {
				// If no audio loaded yet, generate it
				await generateLessonAudio();
			}
		}
	}
	
	// Generate lesson audio using backend API
	async function generateLessonAudio() {
		isLoadingAudio = true;
		try {
			const audioUrl = await generateSpeech(topic.id, lesson.id, lesson.content, selectedVoice);

			console.log('Generated audio URL:', audioUrl);

			if (!audioUrl) {
				throw new Error('Failed to generate audio');
			}

			// Revoke previous blob URL if it exists (for Puter.js)
			if (currentObjectUrl && currentObjectUrl.startsWith('blob:')) {
				URL.revokeObjectURL(currentObjectUrl);
			}

			// Set audio source and load
			audio.src = audioUrl;
			currentObjectUrl = audioUrl; // Track for cleanup
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
		const percentage = Math.max(0, Math.min(1, x / rect.width));
		const newTime = percentage * duration;
		
		audio.currentTime = newTime;
		currentTime = newTime;
	}
	
	// Start dragging on progress bar
	function handleProgressMouseDown(event) {
		if (!audio || !duration) return;
		event.preventDefault(); // Prevent default drag behavior
		isDragging = true;
		progressBarRect = event.currentTarget.getBoundingClientRect();
		seekAudio(event);
	}
	
	// Handle mouse move while dragging
	function handleProgressMouseMove(event) {
		if (!isDragging || !audio || !duration || !progressBarRect) return;
		
		const x = event.clientX - progressBarRect.left;
		const percentage = Math.max(0, Math.min(1, x / progressBarRect.width));
		const newTime = percentage * duration;
		
		audio.currentTime = newTime;
		currentTime = newTime;
	}
	
	// Stop dragging
	function handleProgressMouseUp() {
		isDragging = false;
		progressBarRect = null;
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
	
	// TEMPORARILY DISABLED: Handle word click in story text
	// This feature is disabled temporarily as it will be replaced by a Chrome extension
	/*
	async function handleWordClick(word) {
		// Clean the word - remove surrounding punctuation but keep hyphens and apostrophes
		const cleanWord = word.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '').toLowerCase().trim();
		if (!cleanWord) return;
		
		selectedWord = cleanWord;
		showDictionary = true;
		isLoadingDictionary = true;
		dictionaryError = null;
		dictionaryData = null;
		
		try {
			// Call dictionary API directly from client
			const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
			
			if (!response.ok) {
				if (response.status === 404) {
					dictionaryError = 'Word not found in dictionary';
				} else {
					dictionaryError = 'Failed to fetch word data';
				}
				return;
			}
			
			const data = await response.json();
			dictionaryData = data;
		} catch (error) {
			console.error('Error fetching dictionary data:', error);
			dictionaryError = 'Failed to fetch word data';
		} finally {
			isLoadingDictionary = false;
		}
	}
	*/
	
	// TEMPORARILY DISABLED: Close dictionary popup
	// This feature is disabled temporarily as it will be replaced by a Chrome extension
	/*
	function closeDictionary() {
		showDictionary = false;
		selectedWord = '';
		dictionaryData = null;
		dictionaryError = null;
	}
	
	// Play pronunciation from dictionary API
	async function playDictionaryAudio(audioUrl) {
		try {
			const dictAudio = new Audio(audioUrl);
			await dictAudio.play();
		} catch (error) {
			console.error('Error playing dictionary audio:', error);
		}
	}
	
	// Make words in content clickable
	function makeWordsClickable(text) {
		// Split text into words and punctuation
		const parts = text.split(/(\s+)/);
		return parts.map((part, i) => {
			// Check if it's a word (not whitespace)
			if (part.trim() && /[a-zA-Z]/.test(part)) {
				return { type: 'word', content: part, key: i };
			}
			return { type: 'space', content: part, key: i };
		});
	}
	*/
	
	// Format time for display
	function formatTime(seconds) {
		if (!seconds || isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
	
	// Keep audio volume in sync with volume state
	$effect(() => {
		if (audio) {
			audio.volume = volume;
		}
	});
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

	<!-- TTS Provider Selector -->
	<div class="provider-selector">
		<label for="tts-provider">TTS Provider:</label>
		<select id="tts-provider" value={selectedProvider} onchange={handleProviderChange}>
			{#each providers as provider}
				<option value={provider.name}>{provider.displayName}</option>
			{/each}
		</select>
	</div>

	<!-- Playback Speed Control -->
	<div class="speed-control">
		<label for="playback-speed">Playback Speed:</label>
		<select id="playback-speed" value={playbackSpeed} onchange={handleSpeedChange}>
			{#each speedOptions as speed}
				<option value={speed}>{speed}x</option>
			{/each}
		</select>
	</div>

	<!-- Voice Selection Control -->
	<div class="voice-control">
		<label for="voice-select">Voice:</label>
		<select id="voice-select" value={selectedVoice} onchange={handleVoiceChange}>
			{#each voiceOptions as voiceOption}
				<option value={voiceOption.value}>{voiceOption.label}</option>
			{/each}
		</select>
	</div>

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
				onmousedown={handleProgressMouseDown}
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
			<div class="volume-control">
				<svg class="volume-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					{#if volume === 0}
						<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
					{:else if volume < 0.5}
						<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
					{:else}
						<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
					{/if}
				</svg>
				<input
					type="range"
					class="volume-slider"
					min="0"
					max="1"
					step="0.01"
					value={volume}
					oninput={handleVolumeChange}
					aria-label="Volume"
				/>
			</div>
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
				<p class="story-text">
					{lesson.content}
				</p>
			</div>

			<!-- Vietnamese translation -->
			<div class="translation-section">
				<h3>Bản dịch (Translation)</h3>
				<p class="translation">{lesson.translation}</p>
			</div>

			{#if qaPairs.length > 0}
				<div class="qa-section">
					<h3>Questions & Answers</h3>
					<div class="qa-list">
						{#each qaPairs as qa, index}
							<div class="qa-item">
								<p class="qa-question"><strong>Q{index + 1}:</strong> {qa.q}</p>
								<p class="qa-answer"><strong>A{index + 1}:</strong> {qa.a}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
	
	<!-- TEMPORARILY DISABLED: Dictionary Popup -->
	<!-- This feature is disabled temporarily as it will be replaced by a Chrome extension -->
	<!--
	{#if showDictionary}
		<div class="dictionary-overlay" onclick={closeDictionary} onkeydown={(e) => e.key === 'Escape' && closeDictionary()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="dictionary-popup" onclick={(e) => e.stopPropagation()}>
				<button class="close-btn" onclick={closeDictionary} aria-label="Close dictionary popup">×</button>
				
				<h3 class="dict-word">{selectedWord}</h3>
				
				{#if isLoadingDictionary}
					<div class="loading">Loading...</div>
				{:else if dictionaryError}
					<div class="error">{dictionaryError}</div>
				{:else if dictionaryData && dictionaryData.length > 0}
					{#each dictionaryData[0].meanings.slice(0, 2) as meaning}
						<div class="meaning-section">
							<h4>{meaning.partOfSpeech}</h4>
							{#if meaning.definitions && meaning.definitions[0]}
								<p class="definition">{meaning.definitions[0].definition}</p>
							{/if}
						</div>
					{/each}
					
					{#if dictionaryData[0].phonetics && dictionaryData[0].phonetics.length > 0}
						<div class="phonetics-section">
							{#each dictionaryData[0].phonetics as phonetic}
								{#if phonetic.text}
									<div class="phonetic-item">
										<span class="ipa">{phonetic.text}</span>
										{#if phonetic.audio}
											<button class="audio-btn" onclick={() => playDictionaryAudio(phonetic.audio)} aria-label="Play pronunciation">
												<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
													<path d="M8 5v14l11-7z"/>
												</svg>
											</button>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
	-->
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

	.provider-selector {
		background: white;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.provider-selector label {
		color: #667eea;
		font-weight: 600;
		font-size: 1rem;
	}

	.provider-selector select {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		color: #333;
		background: white;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.provider-selector select:hover {
		border-color: #667eea;
	}

	.provider-selector select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.speed-control {
		background: white;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.speed-control label {
		color: #667eea;
		font-weight: 600;
		font-size: 1rem;
	}

	.speed-control select {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		color: #333;
		background: white;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.speed-control select:hover {
		border-color: #667eea;
	}

	.speed-control select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.voice-control {
		background: white;
		border-radius: 12px;
		padding: 1rem 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.voice-control label {
		color: #667eea;
		font-weight: 600;
		font-size: 1rem;
	}

	.voice-control select {
		flex: 1;
		padding: 0.5rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		color: #333;
		background: white;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.voice-control select:hover {
		border-color: #667eea;
	}

	.voice-control select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
		transition: height 0.2s;
		user-select: none;
	}
	
	.progress-bar:hover,
	.progress-bar:active {
		height: 12px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 4px;
		transition: width 0.1s linear;
	}

	.volume-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.volume-icon {
		color: #667eea;
		flex-shrink: 0;
	}

	.volume-slider {
		width: 90px;
		height: 4px;
		-webkit-appearance: none;
		appearance: none;
		background: #e0e0e0;
		border-radius: 2px;
		cursor: pointer;
		outline: none;
	}

	.volume-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #667eea;
		cursor: pointer;
		transition: transform 0.15s;
	}

	.volume-slider::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: none;
		border-radius: 50%;
		background: #667eea;
		cursor: pointer;
		transition: transform 0.15s;
	}

	.volume-slider:hover::-webkit-slider-thumb,
	.volume-slider:focus::-webkit-slider-thumb {
		transform: scale(1.3);
	}

	.volume-slider:hover::-moz-range-thumb,
	.volume-slider:focus::-moz-range-thumb {
		transform: scale(1.3);
	}

	.volume-slider::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 2px;
	}

	.volume-slider::-moz-range-track {
		height: 4px;
		border-radius: 2px;
		background: #e0e0e0;
	}

	.volume-slider::-moz-range-progress {
		height: 4px;
		border-radius: 2px;
		background: #667eea;
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
		white-space: pre-line;
	}

	.qa-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #f0f0f0;
	}

	.qa-section h3 {
		color: #667eea;
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
	}

	.qa-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.qa-item {
		background: #f8f9ff;
		border: 1px solid #e4e7ff;
		border-radius: 10px;
		padding: 1rem;
	}

	.qa-question,
	.qa-answer {
		margin: 0;
		line-height: 1.6;
	}

	.qa-question + .qa-answer {
		margin-top: 0.5rem;
	}

	.qa-question strong {
		color: #667eea;
	}

	.qa-answer strong {
		color: #764ba2;
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

	/* TEMPORARILY DISABLED: Clickable word styles */
	/* This feature is disabled temporarily as it will be replaced by a Chrome extension */
	/*
	.clickable-word {
		cursor: pointer;
		color: #667eea;
		transition: all 0.2s;
		border-bottom: 1px dotted transparent;
		outline: none;
	}

	.clickable-word:hover,
	.clickable-word:focus {
		border-bottom-color: #667eea;
		background: rgba(102, 126, 234, 0.1);
		border-radius: 2px;
	}
	*/

	/* TEMPORARILY DISABLED: Dictionary Popup Styles */
	/* This feature is disabled temporarily as it will be replaced by a Chrome extension */
	/*
	.dictionary-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.dictionary-popup {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		position: relative;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.close-btn {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 2rem;
		color: #999;
		cursor: pointer;
		line-height: 1;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #667eea;
	}

	.dict-word {
		color: #667eea;
		margin: 0 0 1.5rem 0;
		font-size: 1.8rem;
		text-transform: capitalize;
		padding-right: 2rem;
	}

	.loading {
		text-align: center;
		color: #999;
		padding: 2rem 0;
	}

	.error {
		text-align: center;
		color: #ff4444;
		padding: 1rem;
		background: #fff0f0;
		border-radius: 8px;
	}

	.meaning-section {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.meaning-section:last-of-type {
		border-bottom: none;
	}

	.meaning-section h4 {
		color: #764ba2;
		font-size: 1rem;
		font-style: italic;
		margin: 0 0 0.5rem 0;
	}

	.definition {
		color: #333;
		font-size: 1rem;
		line-height: 1.6;
		margin: 0;
	}

	.phonetics-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #f0f0f0;
	}

	.phonetic-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.ipa {
		font-family: 'Courier New', monospace;
		color: #667eea;
		font-size: 1.1rem;
	}

	.audio-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: white;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
	}

	.audio-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
	}
	*/

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

		.audio-player {
			padding: 1rem;
		}
	}
</style>