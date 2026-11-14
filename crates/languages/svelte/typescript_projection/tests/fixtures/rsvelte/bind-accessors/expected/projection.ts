;

	import C from './C.svelte';
const s = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("i", {});
      (v);
    }
  };
  return __rsvelte_snippet_return;
};

	let v = $state(1);
	let rest = {};

;

async () => {
  {
    svelteHTML.createElement("p", {});
  }
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      "a": 1,
      "value": __rsvelte_get_set(() => v, (x) => (v = x)),
      ...(rest),
      "other": v,
      "b": 2,
    });
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
  }
  if (v) {
    {
      svelteHTML.createElement("span", {});
    }
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        children: __rsvelte_children,
        "open": __rsvelte_get_set(() => v, (x) => (v = x)),
      });
      (v);
      C;
    }
  }
  __rsvelte_ensure_snippet(s());
};
const BindAccessors__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindAccessors__SvelteComponent_ = ReturnType<typeof BindAccessors__SvelteComponent_>;
export default BindAccessors__SvelteComponent_;
