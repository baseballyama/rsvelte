;
import { writable } from 'svelte/store';;

;

function $$render() {
  
	
	const count = writable(0);;let $count = __sveltets_2_store_get(count);


;

  async () => {
    {
      svelteHTML.createElement("p", {});
      $count;
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const Store__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Store__SvelteComponent_>} Store__SvelteComponent_ */
export default Store__SvelteComponent_;
