<script>
import { onMount } from 'svelte';

let { data } = $props();

let dialogueAudio = $state('');
let storyAudio = $state('');
let loadingDialogue = $state(false);
let loadingStory = $state(false);
let audioError = $state('');

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const dialogueText = $derived((data.lesson.dialogue ?? []).map((item) => `${item.speaker}: ${item.text}`).join(' '));
const storyText = $derived(data.lesson.story?.text ?? '');

async function generateAudio(text, key, voice = 'male') {
const response = await fetch(`${BACKEND_URL}/api/tts/generate-text`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ text, key, voice })
});

if (!response.ok) {
throw new Error('Failed to generate audio');
}

const result = await response.json();
return `${BACKEND_URL}${result.audioUrl}`;
}

onMount(async () => {
try {
if (dialogueText) {
loadingDialogue = true;
dialogueAudio = await generateAudio(dialogueText, `mid-level-${data.cycle}-${data.lesson.lesson_id}-dialogue`);
}

if (storyText) {
loadingStory = true;
storyAudio = await generateAudio(storyText, `mid-level-${data.cycle}-${data.lesson.lesson_id}-story`);
}
} catch {
audioError = 'Unable to load audio right now.';
} finally {
loadingDialogue = false;
loadingStory = false;
}
});
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

{#if audioError}
<p class="audio-error">{audioError}</p>
{/if}

<section class="section-card">
<h2>Vocabulary</h2>
<div class="vocabulary-list">
{#each data.lesson.vocabulary ?? [] as item}
<div class="vocabulary-item">
<div class="word-row">
<strong>{item.word}</strong>
<span class="type">{item.type}</span>
</div>
<p class="ipa">{item.ipa}</p>
<p class="meaning">{item.meaning}</p>
</div>
{/each}
</div>
</section>

<section class="section-card">
<h2>Dialogue</h2>
{#if loadingDialogue}
<p>Loading dialogue audio...</p>
{:else if dialogueAudio}
<audio controls src={dialogueAudio}></audio>
{/if}
<div class="dialogue-list">
{#each data.lesson.dialogue ?? [] as line}
<p><strong>{line.speaker}:</strong> {line.text}</p>
{/each}
</div>
</section>

<section class="section-card">
<h2>Story</h2>
{#if loadingStory}
<p>Loading story audio...</p>
{:else if storyAudio}
<audio controls src={storyAudio}></audio>
{/if}
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

audio {
width: 100%;
margin-bottom: 1rem;
}

.section-card h2 {
margin: 0 0 0.75rem;
color: #667eea;
}

.vocabulary-list,
.dialogue-list,
.question-list {
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.vocabulary-item,
.question-item {
background: #f8f9ff;
border: 1px solid #e4e7ff;
border-radius: 10px;
padding: 0.75rem;
}

.word-row {
display: flex;
align-items: center;
gap: 0.5rem;
}

.type {
font-size: 0.8rem;
color: #764ba2;
font-weight: 600;
}

.ipa,
.meaning,
.story,
.question-item p,
.dialogue-list p {
margin: 0.25rem 0;
}

.ipa {
color: #6b7280;
}

.meaning {
color: #111827;
}

.story {
line-height: 1.7;
white-space: pre-line;
}
</style>
