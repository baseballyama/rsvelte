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
const ModuleImports__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ModuleImports__SvelteComponent_ = ReturnType<typeof ModuleImports__SvelteComponent_>;
export default ModuleImports__SvelteComponent_;
