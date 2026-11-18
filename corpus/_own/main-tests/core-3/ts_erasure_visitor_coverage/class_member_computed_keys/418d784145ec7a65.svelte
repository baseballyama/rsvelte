<script lang="ts">
	const k = 'a';
	class A { [k as string] = 1; }
	console.log(A);
</script>

<p>ok</p>
