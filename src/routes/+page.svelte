<script>
	let { data } = $props();
</script>

<div class="container">
	<div class="intro">
		<h2>Welcome to Your English Learning Journey!</h2>
		<p>Choose a topic below to start learning. Each topic contains multiple lessons to help you master English step by step.</p>
	</div>

	<div class="topics-grid">
		{#each data.topics as topic}
			<a href="/topic/{topic.id}" class="topic-card">
				<div class="topic-header">
					<h3>{topic.title}</h3>
					<span class="lesson-count">{topic.lessons.length} lessons</span>
				</div>
				<p class="topic-description">{topic.description}</p>
				<div class="topic-footer">
					<span class="start-learning">Start Learning →</span>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.intro {
		text-align: center;
		margin-bottom: 3rem;
		color: white;
	}

	.intro h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.intro p {
		font-size: 1.2rem;
		opacity: 0.95;
		max-width: 700px;
		margin: 0 auto;
	}

	.topics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.topic-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
	}

	.topic-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
	}

	.topic-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 1rem;
	}

	.topic-card h3 {
		margin: 0;
		color: #667eea;
		font-size: 1.5rem;
		flex: 1;
	}

	.lesson-count {
		background: #667eea;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.9rem;
		white-space: nowrap;
		margin-left: 1rem;
	}

	.topic-description {
		color: #555;
		line-height: 1.6;
		margin: 0 0 1rem 0;
		flex: 1;
	}

	.topic-footer {
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.start-learning {
		color: #667eea;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
	}

	@media (max-width: 768px) {
		.topics-grid {
			grid-template-columns: 1fr;
		}

		.intro h2 {
			font-size: 1.5rem;
		}

		.intro p {
			font-size: 1rem;
		}
	}
</style>
