<script>
	let n = $state(0);
	let log = $state('');

	function run() {
		outer: for (let i = 0; i < 2; i++) {
			inner: for (let j = 0; j < 2; j++) {
				if (j) continue outer;
				if (i > 1) break outer;
			}
		}

		try {
			throw new Error('x');
		} catch {
			log += 'c';
		} finally {
			log += 'f';
		}

		switch (n) {
			case 0:
			case 1: {
				log += 'a';
				break;
			}
			default:
				log += 'd';
		}

		do {
			n += 1;
		} while (n < 2);

		with_like: {
			break with_like;
		}
	}
</script>

<button onclick={run}>{n}{log}</button>
