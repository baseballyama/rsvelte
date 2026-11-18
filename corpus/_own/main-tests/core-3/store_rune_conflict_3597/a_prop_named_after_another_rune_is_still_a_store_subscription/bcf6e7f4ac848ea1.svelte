<script>
	let { state = 1 } = $props();
	let v = $state(1);
</script>

<b>{typeof v}{typeof state}</b>
