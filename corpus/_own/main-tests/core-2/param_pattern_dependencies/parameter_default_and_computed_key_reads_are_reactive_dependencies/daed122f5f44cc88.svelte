<script>
	export let id;
	$: value = (({ [id]: key, value = id }) => key ?? value)({});
</script>