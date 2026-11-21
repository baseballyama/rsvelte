;
import A from './A.svelte';;

;

function $$render() {
   let x = $state(1);
;

  async () => {
    {
      __rsvelte_component(A)(__rsvelte_internals(), {
        children: __rsvelte_children,
        "children": "foo",
      });
      {
        svelteHTML.createElement("p", {});
        x;
      }
      A;
    }
    {
      __rsvelte_component(A)(__rsvelte_internals(), {
        children: __rsvelte_children,
        "children": 2,
        "position": "apart",
      });
      {
        svelteHTML.createElement("b", {});
      }
      A;
    }
    {
      __rsvelte_component(A)(__rsvelte_internals(), {
        children: __rsvelte_children,
        "children": x,
      });
      A;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ChildrenPropBesideContent__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ChildrenPropBesideContent__SvelteComponent_>} ChildrenPropBesideContent__SvelteComponent_ */
export default ChildrenPropBesideContent__SvelteComponent_;
