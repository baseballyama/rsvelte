;

	import { writable } from 'svelte/store';
const s = () => {
  async () => {
    ($a);
  };
  return __rsvelte_snippet_return;
};

	const a = writable(1);;let $a = __rsvelte_store_get(a);

	const b = writable(2);;let $b = __rsvelte_store_get(b);

	const c = writable(3);;let $c = __rsvelte_store_get(c);

	const tag = writable('div');;let $tag = __rsvelte_store_get(tag);

	const xs = writable([]);;let $xs = __rsvelte_store_get(xs);

	const action = writable(() => {});;let $action = __rsvelte_store_get(action);


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
const StoreOrder__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof StoreOrder__SvelteComponent_>} */ (StoreOrder__SvelteComponent_);
