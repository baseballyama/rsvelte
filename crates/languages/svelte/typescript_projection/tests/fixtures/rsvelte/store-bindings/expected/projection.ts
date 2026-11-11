;

	import { writable } from 'svelte/store';
	import Child from './Child.svelte';
	const count = writable(0);;let $count!: __rsvelte_store_value<typeof count>;

	const obj = writable({ a: 1, list: [{ v: 1 }] });;let $obj!: __rsvelte_store_value<typeof obj>;


;

() => {
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
    __rsvelte_component(Child)(__rsvelte_internals(), {
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
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
