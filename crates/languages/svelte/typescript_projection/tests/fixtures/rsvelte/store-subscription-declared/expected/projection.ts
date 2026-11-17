;
import { writable } from "svelte/store";;

;

function $$render() {
  
	
	const a = writable(0);;let $a = __sveltets_2_store_get(a);
 // $a
	declare const $a: string;

;

  async () => {
    $a;
  };
  return __rsvelte_export_component<__rsvelte_no_props, {}, string>();
}
const StoreSubscriptionDeclared__SvelteComponent_ = $$render();
type StoreSubscriptionDeclared__SvelteComponent_ = ReturnType<typeof StoreSubscriptionDeclared__SvelteComponent_>;
export default StoreSubscriptionDeclared__SvelteComponent_;
