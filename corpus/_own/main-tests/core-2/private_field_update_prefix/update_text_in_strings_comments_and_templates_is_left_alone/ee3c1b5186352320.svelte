<script>
class C {
	#count = $state(0);
	m() {
		const a = '++this.#count';
		const b = "--this.#count";
		const c = `++this.#count ${this.#count}`;
		// ++this.#count in a comment
		/* --this.#count */
		const d = 'this.#count++ this.#count--';
		++this.#count;
		return [a, b, c, d];
	}
}
</script>
