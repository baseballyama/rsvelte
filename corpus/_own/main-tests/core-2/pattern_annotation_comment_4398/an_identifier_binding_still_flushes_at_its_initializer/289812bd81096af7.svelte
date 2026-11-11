<script lang="ts">
	function f(a: { /* c */ b?: number }, z: number) { return a.b + z; }
	let n = f({ b: 1 }, 2);
</script>
<i>{n}</i>
