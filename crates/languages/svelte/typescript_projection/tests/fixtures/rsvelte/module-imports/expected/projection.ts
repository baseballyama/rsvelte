;

	import { browser } from './environment.js';

	export const label = browser ? 'browser' : 'server';

;


	import { onMount } from 'svelte';

	let count = $state(0);
	onMount(() => count++);

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (label);
    (count);
  }
};
const ModuleImports__SvelteComponent_ = __rsvelte_export_component();
export default ModuleImports__SvelteComponent_;
