<script>
class C {
	#count = $state(0);
	#countÉ = 0;
	#count$ = 0;
	m() {
		++this.#countÉ;
		--this.#countÉ;
		++this.#count$;
		return this.#countÉ + this.#count$;
	}
}
</script>
