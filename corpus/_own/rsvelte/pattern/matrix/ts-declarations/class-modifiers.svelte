<script lang="ts">
	class Store {
		private readonly id: string;
		protected count = 0;

		constructor(id: string) {
			this.id = id;
		}
	}

	const store = new Store('a');
</script>

<p>{Boolean(store)}</p>
