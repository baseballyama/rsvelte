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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ModuleImports__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ModuleImports__SvelteComponent_>} ModuleImports__SvelteComponent_ */
export default ModuleImports__SvelteComponent_;
