<script>
	let { onclick, onkeydown } = $props();
	let kind = $state('click');
	const handlers = {
		click: () => console.log('c'),
		key: (e) => console.log(e),
	};
</script>

<button {onclick}>shorthand prop handler</button>
<input {onkeydown} oninput={handlers[kind]} onchange={handlers['key']} />
<button onclick={handlers[kind] ?? onclick}>fallback</button>
<button onpointerdown={function named(e) {
	console.log(named.name, e.type);
}}>fn expr</button>
