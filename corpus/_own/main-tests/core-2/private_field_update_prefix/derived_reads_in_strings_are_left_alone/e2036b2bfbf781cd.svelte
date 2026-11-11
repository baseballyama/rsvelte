<script>
class C {
	#count = $state(0);
	#countÉ = 1;
	d = $derived(`this.#count ${this.#count}` + this.#countÉ + 'this.#count');
}
</script>
