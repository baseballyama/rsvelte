<script>
	class C {
		#or = $state.raw('t');
		#and = $state.raw('');
		#nullish = $state.raw('v');
		get or() { return (this.#or ||= 'a'); }
		get and() { return (this.#and &&= 'a'); }
		get nullish() { return (this.#nullish ??= 'a'); }
	}
</script>