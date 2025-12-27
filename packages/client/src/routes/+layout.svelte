<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>ViVu - Learn English</title>
</svelte:head>

<div class="app">
	<header>
		<div class="container">
			<h1>ViVu - Learn English</h1>
			<p class="tagline">Master English topics step by step</p>
		</div>
	</header>
	
	<main>
		{@render children()}
	</main>
	
	<footer>
		<div class="container">
			<p>&copy; 2025 ViVu. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 2rem 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	header h1 {
		margin: 0;
		color: white;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.tagline {
		margin: 0.5rem 0 0 0;
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.1rem;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	main {
		flex: 1;
		padding: 2rem 0;
	}

	footer {
		background: rgba(0, 0, 0, 0.2);
		padding: 1.5rem 0;
		text-align: center;
		color: rgba(255, 255, 255, 0.8);
	}

	footer p {
		margin: 0;
	}
</style>
