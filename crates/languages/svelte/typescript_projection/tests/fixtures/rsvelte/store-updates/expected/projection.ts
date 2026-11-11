;
import { writable } from 'svelte/store'; let a = $state(writable(1)); function f() { a = writable(2); $a++; ++$a; $a -= 1; $a.x--; }
;

() => {
  {
    svelteHTML.createElement("p", {});
    ($a);
    (a);
  }
  {
    svelteHTML.createElement("button", {
      onclick: f,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
