<script>
	let { 10n: ten = $bindable(), 0n: zero, ...rest } = $props();
	ten = 1;
</script>

{ten}{zero}{rest.x}
