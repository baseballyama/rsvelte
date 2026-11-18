<script lang="ts">
	function f(a: { /* c */ b?: number }) { return a.b; }
	let n = f({ b: 1 });
</script>
<i>{n}</i>
