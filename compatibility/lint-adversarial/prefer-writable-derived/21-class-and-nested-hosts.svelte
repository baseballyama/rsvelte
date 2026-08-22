<script>
	let src = $state(0);
	class Box {
		v = $state(0);
		constructor() {
			$effect(() => {
				this.v = src;
			});
		}
	}
	const obj = {
		run() {
			let inner = $state(0);
			$effect(() => {
				inner = src;
			});
			return inner;
		}
	};
	void [new Box(), obj];
</script>

{src}
