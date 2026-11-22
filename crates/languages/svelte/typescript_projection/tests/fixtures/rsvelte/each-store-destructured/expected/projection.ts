;
import { writable } from 'svelte/store';;

;

function $$render() {
  
	
	const items = writable([]);;let $items = __rsvelte_store_get(items);


;

  async () => {
    {
      for (let [i, { name, icon = 1 }] of __rsvelte_each($items)) {
        (name);
        {
          svelteHTML.createElement("p", {});
          name;
          icon;
          i;
        }
      }
    }
    {
      for (let [, [a, b]] of __rsvelte_each($items)) {
        {
          svelteHTML.createElement("button", {
            "onclick": () => { a.x = 1; },
          });
          a;
          b;
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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const EachStoreDestructured__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof EachStoreDestructured__SvelteComponent_>} EachStoreDestructured__SvelteComponent_ */
export default EachStoreDestructured__SvelteComponent_;
