<script>
	let a = $state(1);
	class Box {
		static v = $derived.by(() => a);
		static {
			void $derived.by(() => a);
		}
		#p = $derived.by(() => a);
		read() {
			return this.#p;
		}
	}
	const obj = {
		get v() {
			return $derived.by(() => a);
		}
	};
	void [new Box(), obj];
</script>

{a}
