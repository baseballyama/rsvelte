<script lang="ts">
	let { a = $bindable() } = $props() satisfies { a?: number };
	let { c } = $props() as { c: number };
	console.log(a, c);
</script>
