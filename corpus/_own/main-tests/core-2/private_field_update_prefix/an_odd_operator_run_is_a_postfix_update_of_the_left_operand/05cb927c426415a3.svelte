<script>
class C {
	#count = $state(0);
	m(a) {
		const x = a+++this.#count;
		const y = a---this.#count;
		return x + y;
	}
}
</script>
