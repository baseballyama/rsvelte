<script>
	async function inClass() {
		class Holder {
			static async load() {
				return import('svelte/internal');
			}
			async method() {
				return import('svelte/internal/client');
			}
		}
		return Holder;
	}
	const obj = {
		async load() {
			return import('svelte/internal/server');
		}
	};
	void [inClass, obj];
</script>
<p>dynamic imports in nested scopes</p>
