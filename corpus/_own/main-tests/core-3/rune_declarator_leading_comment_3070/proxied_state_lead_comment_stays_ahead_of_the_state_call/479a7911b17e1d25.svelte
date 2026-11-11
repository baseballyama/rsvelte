<script>
	let a = /* c */ $state({ n: 0 });
</script>

<button onclick={() => (a = { n: 1 })}>{a.n}</button>
