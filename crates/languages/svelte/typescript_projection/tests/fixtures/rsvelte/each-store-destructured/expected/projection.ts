;

	import { writable } from 'svelte/store';
	const items = writable([]);;let $items = __rsvelte_store_get(items);


;

async () => {
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
const EachStoreDestructured__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EachStoreDestructured__SvelteComponent_>} */ (EachStoreDestructured__SvelteComponent_);
