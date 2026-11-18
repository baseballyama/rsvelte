<script>
	export let count;
	$: twice = count * 2;
	$: twice = count * 3;
</script>

{twice}
