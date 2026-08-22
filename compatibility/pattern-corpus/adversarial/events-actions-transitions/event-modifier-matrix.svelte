<script>
	let n = $state(0);
	const bump = () => n++;
</script>

<button on:click|preventDefault={bump}>pd</button>
<button on:click|stopPropagation|once={bump}>sp once</button>
<button on:click|capture={bump}>capture</button>
<button on:click|self|trusted={bump}>self trusted</button>
<div on:wheel|passive={bump} on:touchstart|nonpassive={bump}>passive pair</div>
<button on:click|stopImmediatePropagation={bump}>sip</button>
<button on:click|preventDefault|stopPropagation|capture|once|self={bump}>all</button>
<button on:click>forwarded</button>
<div on:custom-event={bump} on:CAPS={bump}>odd names</div>

<p>{n}</p>
