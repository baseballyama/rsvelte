<script lang="ts">
	class Store {
		readonly kind = 'store' as const;
		protected hidden = $state(0);
		public visible = $state(1);
		declare marker: string;
		accessor tagged = $state('t');
		static shared = $state(2);
		#secret = $derived(this.visible * 2);

		get secret(): number {
			return this.#secret;
		}

		bump(this: Store, by: number = 1): void {
			this.visible += by;
			this.hidden += by;
		}
	}

	const s = new Store();
</script>

<button onclick={() => s.bump()}>{s.visible}{s.secret}{Store.shared}{s.tagged}</button>
