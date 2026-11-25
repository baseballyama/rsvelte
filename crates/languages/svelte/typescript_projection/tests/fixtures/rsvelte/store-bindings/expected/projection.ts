;
import { writable } from 'svelte/store';;
import Child from './Child.svelte';;

;

function $$render() {
  
	
	
	const count = writable(0);;let $count = __rsvelte_store_get(count);

	const obj = writable({ a: 1, list: [{ v: 1 }] });;let $obj = __rsvelte_store_get(obj);


;

  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:value": $count,
      });
      () => {
        // @ts-ignore
        $count = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": $obj.a,
      });
      () => {
        // @ts-ignore
        $obj.a = __rsvelte_untyped_prop();
      };
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(Child);
      const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
        "value": $count,
        "other": $obj.a,
      });
      () => {
        // @ts-ignore
        $count = __rsvelte_untyped_prop();
      };
      () => {
        // @ts-ignore
        $obj.a = __rsvelte_untyped_prop();
      };
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "value";
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "other";
    }
    {
      for (let [, item] of __rsvelte_each($obj.list)) {
        {
          svelteHTML.createElement("input", {
            "bind:value": item.v,
          });
          () => {
            // @ts-ignore
            item.v = __rsvelte_untyped_prop();
          };
        }
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => { $obj.a++; $count--; ++$count; },
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const StoreBindings__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof StoreBindings__SvelteComponent_>} StoreBindings__SvelteComponent_ */
export default StoreBindings__SvelteComponent_;
