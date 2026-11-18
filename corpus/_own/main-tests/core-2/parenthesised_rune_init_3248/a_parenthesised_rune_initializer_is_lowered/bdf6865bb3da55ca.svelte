<script>
	let base = $state(1);
	let { v } = ($derived({ v: base }));
</script>
<div>{base}{v}</div>
