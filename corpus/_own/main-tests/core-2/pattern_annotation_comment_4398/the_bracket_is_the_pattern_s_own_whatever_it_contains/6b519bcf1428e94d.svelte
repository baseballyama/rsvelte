<script lang="ts">
	let { a: { b } }: { /* c */ a: { b: number } } = { a: { b: 1 } };
</script>
<i>{b}</i>
