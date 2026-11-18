<script lang="ts">
	function f({ a }: { /* c */ a?: number }) { return a; }
	let n = f({ a: 1 });
</script>
<i>{n}</i>
