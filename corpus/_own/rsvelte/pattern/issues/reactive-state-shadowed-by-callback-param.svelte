<script>
	export let songs = [];

	let stats = { totalPlays: 0, label: '' };
	let count = 0;

	$: {
		if (songs) {
			stats = songs.reduce(
				(stats, song) => {
					stats.totalPlays += song.playCount;
					return stats;
				},
				{ totalPlays: 0, label: '' }
			);
			songs.forEach((count) => {
				count = 1;
				count++;
			});
		}
	}

	function later() {
		stats.label = 'done';
		count = count + 1;
	}
</script>

<button on:click={later}>{stats.totalPlays}{count}</button>
