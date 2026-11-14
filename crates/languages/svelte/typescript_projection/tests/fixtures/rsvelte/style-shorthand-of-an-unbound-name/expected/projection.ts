;

	import { writable } from 'svelte/store';

	const store = writable('v');;let $store = __rsvelte_store_get(store);

	const color = 'red';
	/** @type {typeof __rsvelte_public_props0} */ let { size } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  size: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("div", {});
    __sveltets_2_ensureType(String, Number, $store);
  }
  {
    svelteHTML.createElement("p", {});
    __sveltets_2_ensureType(String, Number, color);
    __sveltets_2_ensureType(String, Number, size);
    __sveltets_2_ensureType(String, Number, width);
  }
};
const StyleShorthandOfAnUnboundName__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof StyleShorthandOfAnUnboundName__SvelteComponent_>} */ (StyleShorthandOfAnUnboundName__SvelteComponent_);
