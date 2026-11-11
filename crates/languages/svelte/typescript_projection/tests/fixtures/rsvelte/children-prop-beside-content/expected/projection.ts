;
import A from './A.svelte'; let x = $state(1);
;

() => {
  {
    __rsvelte_component(A)(__rsvelte_internals(), {
      children: __rsvelte_children,
      "children": "foo",
    });
    {
      svelteHTML.createElement("p", {});
      (x);
    }
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
  }
  {
    __rsvelte_component(A)(__rsvelte_internals(), {
      children: __rsvelte_children,
      "children": x,
    });
  }
};
const ChildrenPropBesideContent__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ChildrenPropBesideContent__SvelteComponent_ = ReturnType<typeof ChildrenPropBesideContent__SvelteComponent_>;
export default ChildrenPropBesideContent__SvelteComponent_;
