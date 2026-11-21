<script>
	class H {
		#subscribe() {}
		subscribe() {}
		run() {
			this.#subscribe();
			this.subscribe();
		}
	}
</script>
