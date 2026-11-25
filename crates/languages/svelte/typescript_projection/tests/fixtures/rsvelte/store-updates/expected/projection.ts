;
import { writable } from 'svelte/store';;

;

function $$render() {
   let a = $state(writable(1));;let $a = __sveltets_2_store_get(a);
 function f() { a = writable(2); $a++; ++$a; $a -= 1; $a.x--; }
;

  async () => {
    {
      svelteHTML.createElement("p", {});
      $a;
      a;
    }
    {
      svelteHTML.createElement("button", {
        "onclick": f,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const StoreUpdates__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof StoreUpdates__SvelteComponent_>} StoreUpdates__SvelteComponent_ */
export default StoreUpdates__SvelteComponent_;
