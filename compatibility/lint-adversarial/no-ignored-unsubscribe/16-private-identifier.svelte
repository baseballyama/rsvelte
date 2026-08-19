<script>
	class Holder {
		#subscribe() {
			return () => {};
		}

		subscribe() {
			return () => {};
		}

		run() {
			// PrivateIdentifier — its ESTree `name` is still "subscribe"
			this.#subscribe();
			// plain Identifier property
			this.subscribe();
		}
	}

	const h = new Holder();
</script>

<button onclick={() => h.run()}>go</button>
