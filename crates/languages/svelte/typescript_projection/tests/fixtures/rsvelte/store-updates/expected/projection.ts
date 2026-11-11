;
import { writable } from 'svelte/store'; let a = $state(writable(1));;let $a!: __rsvelte_store_value<typeof a>;
 function f() { a = writable(2); $a++; ++$a; $a -= 1; $a.x--; }
;

async () => {
  {
    svelteHTML.createElement("p", {});
    ($a);
    (a);
  }
  {
    svelteHTML.createElement("button", {
      "onclick": f,
    });
  }
};
const StoreUpdates__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type StoreUpdates__SvelteComponent_ = ReturnType<typeof StoreUpdates__SvelteComponent_>;
export default StoreUpdates__SvelteComponent_;
