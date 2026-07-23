<script>
	let { data } = $props();
</script>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">← Home</a>
	</nav>

	<div class="header-card">
		<h1>Level 3 Lessons</h1>
		<p>All lessons from advanced level data.</p>
	</div>

	<div class="lessons-list">
		{#each data.lessons as lesson}
			<a href="/level/3/lesson/{lesson.id}" class="lesson-card">
				<div class="badge">{lesson.category} · Lesson {lesson.id}</div>
				<h3>{lesson.title}</h3>
				<p>{lesson.topic}</p>
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
		margin-bottom: 1.5rem;
	}

	.breadcrumb a {
		color: white;
		text-decoration: none;
	}

	.header-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.header-card h1 {
		margin: 0 0 0.5rem 0;
		color: #667eea;
	}

	.header-card p {
		margin: 0;
		color: #555;
	}

	.lessons-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.lesson-card {
		background: white;
		border-radius: 12px;
		padding: 1rem 1.25rem;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.lesson-card:hover {
		transform: translateY(-2px);
	}

	.badge {
		display: inline-block;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		background: #eef1ff;
		color: #667eea;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.lesson-card h3 {
		margin: 0 0 0.3rem 0;
	}

	.lesson-card p {
		margin: 0;
		color: #555;
	}
</style>
