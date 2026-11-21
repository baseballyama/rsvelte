<script lang="ts">
	import Legacy from './legacy.svelte';
	import LegacyExport from './legacy-export.svelte';
	import TemplateAwait from './template-await.svelte';
	import Events from './events.svelte';
	import Slots from './slots.svelte';
	import OwnRecord from './own-record.svelte';
	import RunesSlotsInterface from './runes-slots-interface.svelte';
	import RunesSlotsRead from './runes-slots-read.svelte';
	import LegacySlotsInterface from './legacy-slots-interface.svelte';
	import EmptyEvents from './empty-events.svelte';
	import DispatchedEvents from './dispatched-events.svelte';
	import ForwardedEvents from './forwarded-events.svelte';
	import StoreNamedState from './store-named-state.svelte';
	let legacy: Legacy | undefined = $state();
	const types: number[] = [Legacy, LegacyExport, TemplateAwait, Events, Slots, RunesSlotsInterface, RunesSlotsRead, LegacySlotsInterface, EmptyEvents, DispatchedEvents, ForwardedEvents, StoreNamedState];
</script>

<Legacy foo="s" bind:this={legacy} />
<LegacyExport foo="s" />
<TemplateAwait foo="s" />
<Events foo="s" />
<Slots foo="s" />
<OwnRecord foo="s" />
<RunesSlotsInterface foo="s" />
<RunesSlotsRead foo="s" />
<LegacySlotsInterface foo="s" />
<EmptyEvents foo="s" />
<DispatchedEvents foo="s" />
<ForwardedEvents foo="s" />
<StoreNamedState foo="s" />
