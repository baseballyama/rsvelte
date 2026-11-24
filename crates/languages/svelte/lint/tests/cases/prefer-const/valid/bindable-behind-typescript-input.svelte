<script lang="ts">
	let { a = $bindable() } = $props() satisfies { a?: number };
	let { b = $bindable() } = $props()!;
	console.log(a, b);
</script>
