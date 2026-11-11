<script lang="ts">
	const f = ([a]: { /* c */ b?: number }[]) => a.b;
	let n = f([{ b: 1 }]);
</script>
<i>{n}</i>
