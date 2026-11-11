<script>
	export let value;
	$: doubled = value * 2;
</script>

{doubled}
