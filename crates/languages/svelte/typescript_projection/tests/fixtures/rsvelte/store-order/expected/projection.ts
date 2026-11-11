;

	import { writable } from 'svelte/store';
const s = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    ($a);
  };
  return __rsvelte_snippet_return;
};

	const a = writable(1);;let $a!: __rsvelte_store_value<typeof a>;

	const b = writable(2);;let $b!: __rsvelte_store_value<typeof b>;

	const c = writable(3);;let $c!: __rsvelte_store_value<typeof c>;

	const tag = writable('div');;let $tag!: __rsvelte_store_value<typeof tag>;

	const xs = writable([]);;let $xs!: __rsvelte_store_value<typeof xs>;

	const action = writable(() => {});;let $action!: __rsvelte_store_value<typeof action>;


;

async () => {
  {
    svelteHTML.createElement($tag, {});
    ($a);
  }
  {
    for (let [, x] of __rsvelte_each($xs)) {
      (x);
    }
    {
      ($c);
    }
  }
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction($action(svelteHTML.mapElementTag("p")));
    svelteHTML.createElement("p", __sveltets_2_union(__rsvelte_action0), {});
    ($b);
  }
  __rsvelte_ensure_snippet(s());
};
const StoreOrder__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type StoreOrder__SvelteComponent_ = ReturnType<typeof StoreOrder__SvelteComponent_>;
export default StoreOrder__SvelteComponent_;
