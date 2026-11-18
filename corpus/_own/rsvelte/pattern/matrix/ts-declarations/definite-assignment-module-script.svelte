<script module lang="ts">
	let cache!: Map<string, number>;

	export function read(key: string) {
		return cache.get(key);
	}
</script>

<p>{read('a')}</p>
