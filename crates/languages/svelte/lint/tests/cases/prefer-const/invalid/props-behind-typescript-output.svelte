<script lang="ts">
	let { a = $bindable() } = $props() satisfies { a?: number };
	const { c } = $props() as { c: number };
	console.log(a, c);
</script>
