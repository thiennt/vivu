<script>
	import { onMount } from 'svelte';
	import { puterProvider } from '$lib/tts-providers.js';

	let { data } = $props();

	const dialogueText = $derived((data.lesson.dialogue ?? []).map((item) => `${item.speaker}: ${item.text}`).join(' '));
	const storyText = $derived(data.lesson.story?.text ?? '');

	// Dialogue audio state
	let dialogueAudio = $state(null);
	let dialogueIsPlaying = $state(false);
	let dialogueIsLoading = $state(false);
	let dialogueCurrentTime = $state(0);
	let dialogueDuration = $state(0);
	let dialogueVolume = $state(1.0);
	let dialogueObjectUrl = null;

	// Story audio state
	let storyAudio = $state(null);
	let storyIsPlaying = $state(false);
	let storyIsLoading = $state(false);
	let storyCurrentTime = $state(0);
	let storyDuration = $state(0);
	let storyVolume = $state(1.0);
	let storyObjectUrl = null;

	let selectedVoice = $state('male');
	let voiceOptions = [
		{ value: 'male', label: 'Matthew (Neural)' },
		{ value: 'female', label: 'Joanna (Neural)' }
	];
	let playbackSpeed = $state(1.0);
	let speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

	let errorMessage = $state(null);

	function createAudioElement(onTimeUpdate, onDurationLoad, onEnded) {
		const el = new Audio();
		el.addEventListener('timeupdate', onTimeUpdate);
		el.addEventListener('loadedmetadata', onDurationLoad);
		el.addEventListener('ended', onEnded);
		return el;
	}

	onMount(() => {
		dialogueAudio = createAudioElement(
			() => { dialogueCurrentTime = dialogueAudio.currentTime; },
			() => { dialogueDuration = dialogueAudio.duration; dialogueAudio.playbackRate = playbackSpeed; },
			() => { dialogueIsPlaying = false; }
		);
		storyAudio = createAudioElement(
			() => { storyCurrentTime = storyAudio.currentTime; },
			() => { storyDuration = storyAudio.duration; storyAudio.playbackRate = playbackSpeed; },
			() => { storyIsPlaying = false; }
		);

		return () => {
			[dialogueAudio, storyAudio].forEach((a) => { if (a) { a.pause(); a.src = ''; } });
			[dialogueObjectUrl, storyObjectUrl].forEach((url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); });
		};
	});

	async function generateAndPlay(text, getAudio, setLoading, setPlaying, getObjectUrl, setObjectUrl) {
		const audio = getAudio();
		if (!audio) return;
		if (audio.src) {
			try { await audio.play(); setPlaying(true); } catch { errorMessage = 'Failed to play audio.'; setTimeout(() => errorMessage = null, 3000); }
			return;
		}
		setLoading(true);
		try {
			const response = await puterProvider.generateAudioWithPuter(text, selectedVoice);
			let url;
			if (response instanceof Blob) {
				url = URL.createObjectURL(response);
			} else if (response?.src) {
				url = response.src;
			} else if (typeof response === 'string') {
				url = response;
			} else {
				throw new Error('Unexpected audio response');
			}
			const prev = getObjectUrl();
			if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
			setObjectUrl(url);
			audio.src = url;
			audio.playbackRate = playbackSpeed;
			audio.load();
			await audio.play();
			setPlaying(true);
		} catch {
			errorMessage = 'Failed to generate audio. Please try again.';
			setTimeout(() => errorMessage = null, 3000);
		} finally {
			setLoading(false);
		}
	}

	async function toggleDialogue() {
		if (!dialogueAudio) return;
		if (dialogueIsPlaying) { dialogueAudio.pause(); dialogueIsPlaying = false; return; }
		await generateAndPlay(
			dialogueText,
			() => dialogueAudio,
			(v) => { dialogueIsLoading = v; },
			(v) => { dialogueIsPlaying = v; },
			() => dialogueObjectUrl,
			(v) => { dialogueObjectUrl = v; }
		);
	}

	async function toggleStory() {
		if (!storyAudio) return;
		if (storyIsPlaying) { storyAudio.pause(); storyIsPlaying = false; return; }
		await generateAndPlay(
			storyText,
			() => storyAudio,
			(v) => { storyIsLoading = v; },
			(v) => { storyIsPlaying = v; },
			() => storyObjectUrl,
			(v) => { storyObjectUrl = v; }
		);
	}

	function seekAudio(audio, duration, event) {
		if (!audio || !duration) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		audio.currentTime = pct * duration;
	}

	function handleVoiceChange(event) {
		selectedVoice = event.target.value;
		// Clear loaded audio so it regenerates with new voice
		[dialogueAudio, storyAudio].forEach((a) => { if (a) { a.pause(); a.src = ''; } });
		[dialogueObjectUrl, storyObjectUrl].forEach((url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url); });
		dialogueObjectUrl = null; storyObjectUrl = null;
		dialogueIsPlaying = false; storyIsPlaying = false;
		dialogueCurrentTime = 0; storyCurrentTime = 0;
		dialogueDuration = 0; storyDuration = 0;
	}

	function handleSpeedChange(event) {
		playbackSpeed = parseFloat(event.target.value);
		[dialogueAudio, storyAudio].forEach((a) => { if (a) a.playbackRate = playbackSpeed; });
	}

	function formatTime(s) {
		if (!s || isNaN(s)) return '0:00';
		return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
	}

	$effect(() => { if (dialogueAudio) dialogueAudio.volume = dialogueVolume; });
	$effect(() => { if (storyAudio) storyAudio.volume = storyVolume; });
</script>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">Home</a>
		<span>/</span>
		<a href="/level/2">Level 2</a>
	</nav>

	<div class="lesson-header">
		<div class="badge">Cycle {data.cycle} · Lesson {data.lesson.lesson_id}</div>
		<h1>{data.lesson.title}</h1>
		<p>{data.lesson.topic}</p>
	</div>

	{#if errorMessage}
		<p class="audio-error">{errorMessage}</p>
	{/if}

	<!-- Audio controls -->
	<div class="audio-controls-bar">
		<div class="control-group">
			<label for="voice-select">Voice:</label>
			<select id="voice-select" value={selectedVoice} onchange={handleVoiceChange}>
				{#each voiceOptions as v}
					<option value={v.value}>{v.label}</option>
				{/each}
			</select>
		</div>
		<div class="control-group">
			<label for="speed-select">Speed:</label>
			<select id="speed-select" value={playbackSpeed} onchange={handleSpeedChange}>
				{#each speedOptions as s}
					<option value={s}>{s}x</option>
				{/each}
			</select>
		</div>
	</div>

	<section class="section-card">
		<h2>Vocabulary</h2>
		<div class="vocabulary-list">
			{#each data.lesson.vocabulary ?? [] as item}
				<div class="vocabulary-row">
					<strong class="vocab-word">{item.word}</strong>
					<span class="type">{item.type}</span>
					<span class="ipa">{item.ipa}</span>
					<span class="meaning">{item.meaning}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="section-card">
		<h2>Dialogue</h2>
		<div class="player-row">
			<button class="play-btn" onclick={toggleDialogue} disabled={dialogueIsLoading} aria-label="Play dialogue">
				{#if dialogueIsLoading}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" opacity="0.25"/>
						<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
							<animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
						</path>
					</svg>
				{:else if dialogueIsPlaying}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
				{:else}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
				{/if}
			</button>
			{#if dialogueDuration > 0}
				<span class="time">{formatTime(dialogueCurrentTime)}</span>
				<button class="progress-bar" onclick={(e) => seekAudio(dialogueAudio, dialogueDuration, e)} aria-label="Seek dialogue" role="slider" aria-valuemin="0" aria-valuemax={dialogueDuration} aria-valuenow={dialogueCurrentTime}>
					<div class="progress-fill" style="width: {(dialogueCurrentTime / dialogueDuration) * 100}%"></div>
				</button>
				<span class="time">{formatTime(dialogueDuration)}</span>
				<input type="range" class="volume-slider" min="0" max="1" step="0.01" value={dialogueVolume} oninput={(e) => { dialogueVolume = parseFloat(e.target.value); }} aria-label="Dialogue volume"/>
			{/if}
		</div>
		<div class="dialogue-list">
			{#each data.lesson.dialogue ?? [] as line}
				<p><strong>{line.speaker}:</strong> {line.text}</p>
			{/each}
		</div>
	</section>

	<section class="section-card">
		<h2>Story</h2>
		<div class="player-row">
			<button class="play-btn" onclick={toggleStory} disabled={storyIsLoading} aria-label="Play story">
				{#if storyIsLoading}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" opacity="0.25"/>
						<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
							<animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
						</path>
					</svg>
				{:else if storyIsPlaying}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
				{:else}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
				{/if}
			</button>
			{#if storyDuration > 0}
				<span class="time">{formatTime(storyCurrentTime)}</span>
				<button class="progress-bar" onclick={(e) => seekAudio(storyAudio, storyDuration, e)} aria-label="Seek story" role="slider" aria-valuemin="0" aria-valuemax={storyDuration} aria-valuenow={storyCurrentTime}>
					<div class="progress-fill" style="width: {(storyCurrentTime / storyDuration) * 100}%"></div>
				</button>
				<span class="time">{formatTime(storyDuration)}</span>
				<input type="range" class="volume-slider" min="0" max="1" step="0.01" value={storyVolume} oninput={(e) => { storyVolume = parseFloat(e.target.value); }} aria-label="Story volume"/>
			{/if}
		</div>
		<p class="story">{data.lesson.story?.text}</p>
	</section>

	<section class="section-card">
		<h2>Questions</h2>
		<div class="question-list">
			{#each data.lesson.questions ?? [] as question}
				<div class="question-item">
					<p><strong>Q:</strong> {question.question}</p>
					<p><strong>A:</strong> {question.suggested_answer}</p>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.breadcrumb {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.breadcrumb,
	.breadcrumb a {
		color: white;
		text-decoration: none;
	}

	.lesson-header,
	.section-card {
		background: white;
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1rem;
	}

	.badge {
		display: inline-block;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		background: #eef1ff;
		color: #667eea;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.lesson-header h1 {
		margin: 0.75rem 0 0.25rem;
		color: #667eea;
	}

	.lesson-header p {
		margin: 0;
		color: #555;
	}

	.audio-error {
		color: #fff;
		background: rgba(255, 86, 86, 0.3);
		padding: 0.7rem 1rem;
		border-radius: 10px;
		margin-bottom: 1rem;
	}

	.audio-controls-bar {
		background: white;
		border-radius: 12px;
		padding: 0.75rem 1.25rem;
		margin-bottom: 1rem;
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #555;
	}

	.control-group select {
		border: 1px solid #e4e7ff;
		border-radius: 6px;
		padding: 0.2rem 0.5rem;
		font-size: 0.85rem;
		color: #333;
	}

	.section-card h2 {
		margin: 0 0 0.75rem;
		color: #667eea;
	}

	/* Vocabulary: one item per line */
	.vocabulary-list {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.vocabulary-row {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.3rem 0.5rem;
		border-radius: 6px;
		background: #f8f9ff;
		border: 1px solid #e4e7ff;
		flex-wrap: wrap;
	}

	.vocab-word {
		min-width: 8rem;
		color: #111827;
	}

	.type {
		font-size: 0.78rem;
		color: #764ba2;
		font-weight: 600;
		min-width: 4rem;
	}

	.ipa {
		font-size: 0.85rem;
		color: #6b7280;
		min-width: 6rem;
	}

	.meaning {
		font-size: 0.9rem;
		color: #374151;
	}

	/* Custom audio player */
	.player-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.play-btn {
		background: #667eea;
		color: white;
		border: none;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
	}

	.play-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.time {
		font-size: 0.8rem;
		color: #6b7280;
		white-space: nowrap;
	}

	.progress-bar {
		flex: 1;
		height: 6px;
		background: #e4e7ff;
		border-radius: 3px;
		border: none;
		padding: 0;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #667eea;
		border-radius: 3px;
		pointer-events: none;
	}

	.volume-slider {
		width: 70px;
		accent-color: #667eea;
	}

	.dialogue-list,
	.question-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.question-item {
		background: #f8f9ff;
		border: 1px solid #e4e7ff;
		border-radius: 10px;
		padding: 0.75rem;
	}

	.question-item p,
	.dialogue-list p {
		margin: 0.25rem 0;
	}

	.story {
		line-height: 1.7;
		white-space: pre-line;
		margin: 0;
	}
</style>
