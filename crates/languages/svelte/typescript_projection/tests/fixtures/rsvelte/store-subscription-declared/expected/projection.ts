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
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({});
}
const StoreSubscriptionDeclared__SvelteComponent_ = $$render();
type StoreSubscriptionDeclared__SvelteComponent_ = InstanceType<typeof StoreSubscriptionDeclared__SvelteComponent_>;
export default StoreSubscriptionDeclared__SvelteComponent_;
