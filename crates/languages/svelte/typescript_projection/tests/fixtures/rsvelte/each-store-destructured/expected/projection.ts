;

	import { writable } from 'svelte/store';
	const items = writable([]);;let $items!: __rsvelte_store_value<typeof items>;


;

() => {
  {
    for (let [i, { name, icon = 1 }] of __rsvelte_each($items)) {
      (name);
      {
        svelteHTML.createElement("p", {});
        (name);
        (icon);
        (i);
      }
    }
  }
  {
    for (let [, [a, b]] of __rsvelte_each($items)) {
      {
        svelteHTML.createElement("button", {
          "onclick": () => { a.x = 1; },
        });
        (a);
        (b);
      }
    }
  }
  {
    for (let [, { c }] of __rsvelte_each($items)) {
      {
        svelteHTML.createElement("input", {
          "bind:value": c.v,
        });
        () => {
          // @ts-ignore
          c.v = __rsvelte_untyped_prop();
        };
      }
    }
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
