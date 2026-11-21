<script lang="ts">
	type Record = { own: true };
	let r: Record = $state({ own: true });
</script>

<p>{r.own}</p>
