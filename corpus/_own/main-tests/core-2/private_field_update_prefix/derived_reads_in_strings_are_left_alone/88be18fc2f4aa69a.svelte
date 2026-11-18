<script>
class C {
	#count = $state(0);
	#countX = 0;
	constructor() {
		this.d = $derived(this.#countX + this.#count + '-this.#count');
	}
}
</script>
