<script>
	let window = $state({ scrollY: 0 });
	let document = $state('doc');
	let globalThis = $state(null);
	let console = { log: (v) => v };
	let Element = $state('el');
	let Node = $derived(Element + '!');
</script>

<button onclick={() => (window.scrollY += 1)}>
	{window.scrollY}:{document}:{globalThis ?? 'null'}:{console.log(Node)}
</button>
