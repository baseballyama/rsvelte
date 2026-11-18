<script>
class C {
	#count = $state(0);
	constructor(other) {
		const s = '++other.#count --other.#count';
		// ++other.#count
		++other.#count;
	}
}
</script>
