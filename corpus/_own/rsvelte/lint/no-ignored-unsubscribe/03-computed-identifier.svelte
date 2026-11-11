<script>
	const subscribe = 'subscribe';
	const bus = {
		subscribe(fn) {
			fn();
		}
	};
	bus[subscribe](() => {});
	bus['subscribe'](() => {});
</script>

<p>{typeof bus}</p>
