;
import A from './A.svelte'; let x = $state(1);
;

async () => {
  {
    __rsvelte_component(A)(__rsvelte_internals(), {
      children: __rsvelte_children,
      "children": "foo",
    });
    {
      svelteHTML.createElement("p", {});
      (x);
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
const ChildrenPropBesideContent__SvelteComponent_ = __rsvelte_export_component();
export default ChildrenPropBesideContent__SvelteComponent_;
