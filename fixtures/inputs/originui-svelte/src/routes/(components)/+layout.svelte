<script lang="ts">
	import Cta from '$lib/demo/cta.svelte';

	import * as ComponentDialog from '$lib/demo/component-preview';
	import { mode } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

<Toaster position="top-right" theme={$mode} />

<ComponentDialog.DialogContextProvider>
	<main class="grow">
		{@render children()}
		<Cta />
	</main>

	<ComponentDialog.Dialog />
</ComponentDialog.DialogContextProvider>
