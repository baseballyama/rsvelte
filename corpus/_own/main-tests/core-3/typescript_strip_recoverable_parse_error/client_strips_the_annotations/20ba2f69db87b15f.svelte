<script lang="ts">
	export let overlay = false;

	const f = (a: string, b?: string, c: string) => {
		return a + (b ?? '') + c;
	};
</script>

<p>{f('x')}{overlay}</p>
