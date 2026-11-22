;
import { writable } from "svelte/store";;

;

function $$render() {
  
	
	const state = writable(1);;let $state = __sveltets_2_store_get(state);


;

  async () => {
    {
      svelteHTML.createElement("p", {});
      $state;
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const StoreNamedState__SvelteComponent_ = $$render();
type StoreNamedState__SvelteComponent_ = InstanceType<typeof StoreNamedState__SvelteComponent_>;
export default StoreNamedState__SvelteComponent_;
