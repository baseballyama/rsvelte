<script>
	let { Child } = $props();
	let store = $state({ v: 1 });
</script>

<Child bind:value={() => store.v, (nv) => (store.v = nv)} />
<Child bind:this={() => null, () => {}} x="1" />
<p>{store.v}</p>
