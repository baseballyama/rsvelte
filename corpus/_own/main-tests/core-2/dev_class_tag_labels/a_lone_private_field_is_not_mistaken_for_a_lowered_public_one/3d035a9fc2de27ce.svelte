<script>
	class Box {
		#width = $state(0);
		get width() { return this.#width; }
	}
	const b = new Box();
</script>
<p>{b.width}</p>
