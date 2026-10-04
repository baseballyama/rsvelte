;

	import { browser } from './environment.js';

	export const label = browser ? 'browser' : 'server';

;


	import { onMount } from 'svelte';

	let count = $state(0);
	onMount(() => count++);

;

() => {
  {
    svelteHTML.createElement("p", {});
    (label);
    (count);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
