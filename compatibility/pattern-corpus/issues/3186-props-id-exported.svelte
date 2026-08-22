<script>
	let o = 1;
	export const uid=$props.id();
	let { label = 'x' } = $props();
</script>

<label for={uid}>{label}{o}</label>
