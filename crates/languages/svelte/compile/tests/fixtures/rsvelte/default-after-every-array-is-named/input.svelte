<script>
	let [a = () => { let [x] = $state([1]); return x; }, [b]] = $state([]);
</script>
<p>{a()}{b}</p>