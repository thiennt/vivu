<svelte:head>
	<title>ViVu - MMO Hub | Viral Trends</title>
</svelte:head>

<script>
	let { data } = $props();

	// --- Tab state ---
	let activeTab = $state('youtube');

	// --- YouTube state ---
	let ytVideos = $state(data.youtubeShorts?.videos ?? []);
	let ytError = $state(data.youtubeShorts?.error ?? null);
	let ytLoading = $state(false);
	let ytCategory = $state('');

	const ytCategories = [
		{ id: '', label: 'All' },
		{ id: '10', label: '🎵 Music' },
		{ id: '20', label: '🎮 Gaming' },
		{ id: '23', label: '😂 Comedy' },
		{ id: '17', label: '⚽ Sports' },
		{ id: '25', label: '📰 News' },
		{ id: '27', label: '🎓 Education' },
		{ id: '24', label: '🎭 Entertainment' },
		{ id: '28', label: '💻 Science & Tech' },
		{ id: '26', label: '🍔 Howto & Style' }
	];

	// --- TikTok state ---
	let ttVideos = $state(data.tiktokTrending?.videos ?? []);
	let ttCategory = $state('All');

	const ttCategories = [
		'All',
		'Entertainment',
		'Dance',
		'Comedy',
		'Food',
		'Travel',
		'Fashion',
		'Sports',
		'DIY',
		'Pets',
		'Music',
		'Education'
	];

	// --- Helpers ---
	function formatCount(n) {
		const num = Number(n);
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
		if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
		return String(num);
	}

	function timeAgo(iso) {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
		const days = Math.floor(hrs / 24);
		return days === 1 ? 'yesterday' : `${days} days ago`;
	}

	// --- YouTube actions ---
	async function fetchYouTube(categoryId) {
		ytLoading = true;
		ytError = null;
		try {
			const url = categoryId
				? `/api/mmo/youtube-shorts?categoryId=${categoryId}`
				: '/api/mmo/youtube-shorts';
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = await res.json();
			ytVideos = json.videos ?? [];
			if (json.error) ytError = json.error;
		} catch (e) {
			ytError = String(e);
			ytVideos = [];
		} finally {
			ytLoading = false;
		}
	}

	function selectYtCategory(id) {
		ytCategory = id;
		fetchYouTube(id);
	}

	function refreshYouTube() {
		fetchYouTube(ytCategory);
	}

	// --- TikTok derived ---
	let filteredTt = $derived(
		ttCategory === 'All' ? ttVideos : ttVideos.filter((v) => v.category === ttCategory)
	);

	// Placeholder cards when no real data is available for a category
	let ttDisplayVideos = $derived(
		filteredTt.length > 0
			? filteredTt
			: Array.from({ length: 8 }, (_, i) => ({
					id: `placeholder-${ttCategory}-${i}`,
					title: `Trending ${ttCategory} video #${i + 1} — check it out! 🔥`,
					author: `@trending_${ttCategory.toLowerCase()}`,
					likes: Math.floor(Math.random() * 5_000_000) + 500_000,
					comments: Math.floor(Math.random() * 50_000) + 5_000,
					shares: Math.floor(Math.random() * 100_000) + 10_000,
					cover: '',
					category: ttCategory,
					url: 'https://www.tiktok.com/trending'
				}))
	);
</script>

<div class="container">
	<div class="page-header">
		<h2>🎬 MMO Hub</h2>
		<p>Discover the most viral content on the internet right now</p>
	</div>

	<!-- Tab bar -->
	<div class="tab-bar" role="tablist">
		<button
			role="tab"
			aria-selected={activeTab === 'youtube'}
			class="tab-btn"
			class:active={activeTab === 'youtube'}
			onclick={() => (activeTab = 'youtube')}
		>
			▶ YouTube Shorts
		</button>
		<button
			role="tab"
			aria-selected={activeTab === 'tiktok'}
			class="tab-btn"
			class:active={activeTab === 'tiktok'}
			onclick={() => (activeTab = 'tiktok')}
		>
			🎵 TikTok
		</button>
		<div class="tab-indicator" style:left={activeTab === 'youtube' ? '0%' : '50%'}></div>
	</div>

	<!-- ───────────────── YouTube Shorts tab ───────────────── -->
	{#if activeTab === 'youtube'}
		<div class="tab-panel" role="tabpanel">
			<div class="panel-toolbar">
				<div class="category-scroll" role="group" aria-label="YouTube categories">
					{#each ytCategories as cat}
						<button
							class="cat-btn"
							class:active={ytCategory === cat.id}
							onclick={() => selectYtCategory(cat.id)}
						>
							{cat.label}
						</button>
					{/each}
				</div>
				<button class="refresh-btn" onclick={refreshYouTube} disabled={ytLoading}>
					{ytLoading ? '⟳ Loading…' : '🔄 Refresh'}
				</button>
			</div>

			{#if ytLoading}
				<div class="spinner-wrap">
					<div class="spinner"></div>
					<p>Fetching viral Shorts…</p>
				</div>
			{:else if ytError && ytVideos.length === 0}
				<div class="error-state">
					<p>⚠️ {ytError}</p>
					<button class="refresh-btn" onclick={refreshYouTube}>↩ Retry</button>
				</div>
			{:else if ytVideos.length === 0}
				<div class="empty-state">
					<p>🎬 No Shorts found for this category right now.</p>
					<button class="refresh-btn" onclick={refreshYouTube}>🔄 Try Again</button>
				</div>
			{:else}
				<div class="video-grid">
					{#each ytVideos as video (video.id)}
						<div class="video-card yt-card">
							<div class="thumbnail-wrap">
								<img
									src={video.thumbnail}
									alt={video.title}
									class="thumbnail"
									onerror={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
								<span class="badge yt-badge">Shorts</span>
							</div>
							<div class="card-body">
								<h4 class="video-title">{video.title}</h4>
								<p class="channel-name">{video.channelTitle}</p>
								<div class="stats-row">
									<span>👁 {formatCount(video.viewCount)} views</span>
									<span>👍 {formatCount(video.likeCount)}</span>
								</div>
								<p class="published-time">🕐 {timeAgo(video.publishedAt)}</p>
							</div>
							<div class="card-footer">
								<a
									href="https://www.youtube.com/shorts/{video.id}"
									target="_blank"
									rel="noopener noreferrer"
									class="watch-btn yt-watch-btn"
								>
									▶ Watch
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ───────────────── TikTok tab ───────────────── -->
	{#if activeTab === 'tiktok'}
		<div class="tab-panel" role="tabpanel">
			<!-- TikTok banner -->
			<div class="tt-banner">
				<span class="tt-logo">🎵</span>
				<div class="tt-banner-text">
					<strong>TikTok Trending</strong>
					<span>Browse trending videos by category</span>
				</div>
				<a
					href="https://www.tiktok.com/trending"
					target="_blank"
					rel="noopener noreferrer"
					class="tt-explore-btn"
				>
					Explore on TikTok ↗
				</a>
			</div>

			<!-- Category filter -->
			<div class="panel-toolbar">
				<div class="category-scroll" role="group" aria-label="TikTok categories">
					{#each ttCategories as cat}
						<button
							class="cat-btn"
							class:active={ttCategory === cat}
							onclick={() => (ttCategory = cat)}
						>
							{cat}
						</button>
					{/each}
				</div>
			</div>

			<div class="video-grid">
				{#each ttDisplayVideos as video (video.id)}
					<div class="video-card tt-card">
						<div class="thumbnail-wrap tt-thumb">
							<div class="tt-cover-placeholder">
								<span class="tt-icon">🎵</span>
							</div>
							<span class="badge tt-badge">{video.category}</span>
						</div>
						<div class="card-body">
							<h4 class="video-title clamp-2">{video.title}</h4>
							<p class="author-name">{video.author}</p>
							<div class="stats-row">
								<span>❤️ {formatCount(video.likes)}</span>
								<span>💬 {formatCount(video.comments)}</span>
							</div>
						</div>
						<div class="card-footer">
							<a
								href={video.url}
								target="_blank"
								rel="noopener noreferrer"
								class="watch-btn tt-watch-btn"
							>
								▶ Watch on TikTok
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.page-header {
		text-align: center;
		color: white;
		margin-bottom: 2rem;
	}

	.page-header h2 {
		font-size: 2rem;
		margin: 0 0 0.5rem;
	}

	.page-header p {
		margin: 0;
		opacity: 0.9;
		font-size: 1.1rem;
	}

	/* ── Tab bar ── */
	.tab-bar {
		position: relative;
		display: flex;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		padding: 0.25rem;
		margin-bottom: 1.5rem;
		overflow: hidden;
	}

	.tab-btn {
		flex: 1;
		background: none;
		border: none;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.75);
		cursor: pointer;
		border-radius: 8px;
		transition: color 0.2s;
		position: relative;
		z-index: 1;
	}

	.tab-btn.active {
		color: white;
	}

	.tab-indicator {
		position: absolute;
		bottom: 0.25rem;
		top: 0.25rem;
		width: 50%;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		transition: left 0.25s ease;
		pointer-events: none;
	}

	/* ── Toolbar ── */
	.panel-toolbar {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	.category-scroll {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		flex: 1;
	}

	.cat-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		padding: 0.4rem 0.85rem;
		border-radius: 20px;
		font-size: 0.85rem;
		color: white;
		cursor: pointer;
		transition: background 0.2s;
		white-space: nowrap;
	}

	.cat-btn:hover {
		background: rgba(255, 255, 255, 0.35);
	}

	.cat-btn.active {
		background: #667eea;
	}

	.refresh-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		padding: 0.45rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		color: white;
		cursor: pointer;
		transition: background 0.2s;
		white-space: nowrap;
	}

	.refresh-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.35);
	}

	.refresh-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* ── States ── */
	.spinner-wrap,
	.error-state,
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: white;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Video grid ── */
	.video-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1.25rem;
	}

	.video-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.video-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
	}

	/* ── Thumbnails ── */
	.thumbnail-wrap {
		position: relative;
		background: #111;
		height: 160px;
		overflow: hidden;
	}

	.thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.tt-thumb {
		background: linear-gradient(135deg, #010101 0%, #1a1a2e 100%);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tt-cover-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.tt-icon {
		font-size: 3rem;
		opacity: 0.6;
	}

	.badge {
		position: absolute;
		top: 8px;
		left: 8px;
		padding: 0.2rem 0.6rem;
		border-radius: 6px;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.yt-badge {
		background: #FF0000;
		color: white;
	}

	.tt-badge {
		background: #010101;
		color: white;
	}

	/* ── Card body ── */
	.card-body {
		padding: 0.85rem 1rem 0.5rem;
		flex: 1;
	}

	.video-title {
		margin: 0 0 0.35rem;
		font-size: 0.95rem;
		font-weight: 600;
		color: #222;
		line-height: 1.4;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.clamp-2 {
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.channel-name,
	.author-name {
		margin: 0 0 0.4rem;
		font-size: 0.85rem;
		color: #667eea;
		font-weight: 500;
	}

	.stats-row {
		display: flex;
		gap: 0.75rem;
		font-size: 0.8rem;
		color: #666;
		margin-bottom: 0.3rem;
	}

	.published-time {
		margin: 0;
		font-size: 0.78rem;
		color: #999;
	}

	/* ── Card footer ── */
	.card-footer {
		padding: 0.6rem 1rem 0.85rem;
	}

	.watch-btn {
		display: block;
		text-align: center;
		padding: 0.5rem;
		border-radius: 8px;
		font-size: 0.88rem;
		font-weight: 600;
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.watch-btn:hover {
		opacity: 0.85;
	}

	.yt-watch-btn {
		background: #FF0000;
		color: white;
	}

	.tt-watch-btn {
		background: #010101;
		color: white;
	}

	/* ── TikTok banner ── */
	.tt-banner {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: white;
		border-radius: 12px;
		padding: 1rem 1.25rem;
		margin-bottom: 1.25rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.tt-logo {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.tt-banner-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.tt-banner-text strong {
		font-size: 1rem;
		color: #010101;
	}

	.tt-banner-text span {
		font-size: 0.85rem;
		color: #666;
	}

	.tt-explore-btn {
		background: #010101;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		text-decoration: none;
		font-size: 0.88rem;
		font-weight: 600;
		white-space: nowrap;
		transition: opacity 0.2s;
	}

	.tt-explore-btn:hover {
		opacity: 0.8;
	}

	/* ── Responsive ── */
	@media (max-width: 600px) {
		.video-grid {
			grid-template-columns: 1fr;
		}

		.page-header h2 {
			font-size: 1.5rem;
		}

		.tt-banner {
			flex-wrap: wrap;
		}

		.tt-explore-btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
