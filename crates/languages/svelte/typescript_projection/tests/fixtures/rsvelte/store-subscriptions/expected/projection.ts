;
;let $page!: __rsvelte_store_value<typeof page>;

	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	let { store }: typeof __rsvelte_public_props0 = $props();;let $store!: __rsvelte_store_value<typeof store>;

	const count = writable(0);;let $count!: __rsvelte_store_value<typeof count>;

	let obj = writable({ a: 1 });;let $obj!: __rsvelte_store_value<typeof obj>;

	function inc() { $count += 1; $count++; $obj.a = 2; $obj = { a: 3 }; }
	let d = $derived($count * 2);
	console.log($page.url);

;

const __rsvelte_public_props0 = __rsvelte_props({
  store: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    svelteHTML.createElement("p", {});
    ($count);
    ($store);
    ($obj.a);
    (d);
  }
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
    svelteHTML.createElement("button", {
      "onclick": () => $count = 5,
    });
  }
  {
    for (let [, item] of __rsvelte_each($obj.list)) {
      (item);
    }
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
