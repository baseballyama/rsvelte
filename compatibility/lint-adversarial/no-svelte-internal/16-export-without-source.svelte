<script module>
	const noop = () => {};
	export { noop };
	export const name = 'svelte/internal';
	export default noop;
</script>

<script>
	export let title = 'svelte/internal';
</script>
<p>{title}</p>
