<script lang="ts">
	import Legacy from './legacy.svelte';
	import LegacyExport from './legacy-export.svelte';
	import TemplateAwait from './template-await.svelte';
	import Events from './events.svelte';
	import Slots from './slots.svelte';
	let legacy: Legacy | undefined = $state();
	const types: number[] = [Legacy, LegacyExport, TemplateAwait, Events, Slots];
</script>

<Legacy foo="s" bind:this={legacy} />
<LegacyExport foo="s" />
<TemplateAwait foo="s" />
<Events foo="s" />
<Slots foo="s" />
