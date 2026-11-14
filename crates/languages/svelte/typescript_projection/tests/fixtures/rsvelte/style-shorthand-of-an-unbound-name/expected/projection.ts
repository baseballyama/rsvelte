;

	import { writable } from 'svelte/store';

	const store = writable('v');;let $store!: __rsvelte_store_value<typeof store>;

	const color = 'red';
	let { size }: typeof __rsvelte_public_props0 = $props();

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
const StyleShorthandOfAnUnboundName__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type StyleShorthandOfAnUnboundName__SvelteComponent_ = ReturnType<typeof StyleShorthandOfAnUnboundName__SvelteComponent_>;
export default StyleShorthandOfAnUnboundName__SvelteComponent_;
