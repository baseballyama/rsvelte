<script>
	let count = 0;

	function schedule(flush) {
		switch (flush) {
			case 'post':
				$effect(() => {
					count;
				});
				break;
		}
	}

	schedule('post');
</script>

<p>{count}</p>
