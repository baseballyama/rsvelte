<script>
	let title = $state('title');

	function local(value) {
		return value;
	}
</script>

<div title={local(title)}></div>
<div title="{local(title).toUpperCase()}"></div>
<div title="pure:{String(title)};local:{local(title)}"></div>
<div title={String(title)}></div>
<button onclick={globalThis.make()}>global handler</button>
<Widget prop={local(title)} />
<Widget
	--single={local(title)}
	--pure={globalThis.make()}
	--mixed="pure:{globalThis.make()};dependent-global:{String(title)};local:{local(title)}"
/>
<svelte:element this="div" title={local(title)}></svelte:element>
<p>{local(title)}</p>
<p>{globalThis.make()}</p>
<p>pure:{globalThis.make()};dependent-global:{String(title)};local:{local(title)}</p>
