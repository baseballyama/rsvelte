<script>
	class C {
		#a = $state();
		constructor() { this.#a ||= { val: 0 }; }
	}
</script>