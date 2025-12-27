<script>
	let { data } = $props();
	let topic = $derived(data.topic);
</script>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">← Back to Topics</a>
	</nav>

	<div class="topic-header">
		<h1>{topic.title}</h1>
		<p class="description">{topic.description}</p>
		<div class="stats">
			<span class="stat">{topic.lessons.length} Lessons</span>
		</div>
	</div>

	<div class="lessons-list">
		<h2>Lessons</h2>
		{#each topic.lessons as lesson, index}
			<a href="/topic/{topic.id}/lesson/{lesson.id}" class="lesson-card">
				<div class="lesson-number">Lesson {index + 1}</div>
				<div class="lesson-content">
					<h3>{lesson.title}</h3>
					<p class="lesson-description">{lesson.content}</p>
					<div class="vocabulary-section">
						<h4>Vocabulary ({lesson.vocabulary.length} words)</h4>
						<div class="vocabulary-list">
							{#each lesson.vocabulary as vocab}
								<span class="vocabulary-item">{vocab.word}</span>
							{/each}
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.breadcrumb {
		margin-bottom: 2rem;
	}

	.breadcrumb a {
		color: white;
		text-decoration: none;
		font-size: 1.1rem;
		display: inline-flex;
		align-items: center;
		opacity: 0.9;
		transition: opacity 0.2s;
	}

	.breadcrumb a:hover {
		opacity: 1;
	}

	.topic-header {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.topic-header h1 {
		margin: 0 0 1rem 0;
		color: #667eea;
		font-size: 2.5rem;
	}

	.description {
		color: #555;
		font-size: 1.2rem;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
	}

	.stats {
		display: flex;
		gap: 1rem;
	}

	.stat {
		background: #667eea;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 600;
	}

	.lessons-list h2 {
		color: white;
		font-size: 2rem;
		margin-bottom: 1.5rem;
	}

	.lesson-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		display: flex;
		gap: 1.5rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s;
	}

	.lesson-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		cursor: pointer;
	}

	.lesson-number {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.9rem;
		height: fit-content;
		white-space: nowrap;
	}

	.lesson-content {
		flex: 1;
	}

	.lesson-content h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.5rem;
	}

	.lesson-description {
		color: #666;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
	}

	.vocabulary-section h4 {
		color: #667eea;
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}

	.vocabulary-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.vocabulary-item {
		background: #f0f0f0;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.95rem;
		color: #333;
		border: 2px solid #e0e0e0;
		transition: all 0.2s;
	}

	.vocabulary-item:hover {
		background: #667eea;
		color: white;
		border-color: #667eea;
		transform: translateY(-2px);
		cursor: default;
	}

	@media (max-width: 768px) {
		.topic-header h1 {
			font-size: 2rem;
		}

		.lesson-card {
			flex-direction: column;
		}

		.lesson-number {
			width: fit-content;
		}
	}
</style>
