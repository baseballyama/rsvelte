;

	import { browser } from './environment.js';

	export const label = browser ? 'browser' : 'server';

;

import { onMount } from 'svelte';;

;

function $$render() {
  
	

	let count = $state(0);
	onMount(() => count++);

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      label;
      count;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const ModuleImports__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof ModuleImports__SvelteComponent_>} */ (ModuleImports__SvelteComponent_);
