<script lang="ts">
	export let n: number = 0;

	const label = (a: string, b?: string, c: string) => {
		return a + (b ?? '') + c;
	};
</script>

<p>{label('x', undefined, 'y')}{n}</p>
