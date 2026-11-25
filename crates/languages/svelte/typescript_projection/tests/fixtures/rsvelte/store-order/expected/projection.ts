;
import { writable } from 'svelte/store';;

;

function $$render() {
  
	
  const s = () => {
    async () => {
      $a;
    };
    return __rsvelte_snippet_return;
  };

	const a = writable(1);;let $a = __sveltets_2_store_get(a);

	const b = writable(2);;let $b = __sveltets_2_store_get(b);

	const c = writable(3);;let $c = __sveltets_2_store_get(c);

	const tag = writable('div');;let $tag = __sveltets_2_store_get(tag);

	const xs = writable([]);;let $xs = __sveltets_2_store_get(xs);

	const action = writable(() => {});;let $action = __sveltets_2_store_get(action);


;

  async () => {
    {
      svelteHTML.createElement($tag, {});
      $a;
    }
    {
      for (let [, x] of __rsvelte_each($xs)) {
        x;
      }
      {
        $c;
      }
    }
    {
      const __rsvelte_action0 = __sveltets_2_ensureAction($action(svelteHTML.mapElementTag("p")));
      svelteHTML.createElement("p", __sveltets_2_union(__rsvelte_action0), {});
      $b;
    }
    __rsvelte_ensure_snippet(s());
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const StoreOrder__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof StoreOrder__SvelteComponent_>} StoreOrder__SvelteComponent_ */
export default StoreOrder__SvelteComponent_;
