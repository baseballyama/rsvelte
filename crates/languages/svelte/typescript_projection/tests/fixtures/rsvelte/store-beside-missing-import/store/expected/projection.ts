;

	import { writable } from 'svelte/store';
	const count = writable(0);;let $count = __rsvelte_store_get(count);


;

async () => {
  {
    svelteHTML.createElement("p", {});
    ($count);
  }
};
const Store__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Store__SvelteComponent_>} */ (Store__SvelteComponent_);
