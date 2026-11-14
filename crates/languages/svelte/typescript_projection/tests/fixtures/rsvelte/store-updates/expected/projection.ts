;
import { writable } from 'svelte/store'; let a = $state(writable(1));;let $a = __rsvelte_store_get(a);
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
const StoreUpdates__SvelteComponent_ = __rsvelte_export_component();
export default StoreUpdates__SvelteComponent_;
