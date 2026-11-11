;

	let { items }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    const __rsvelte_component_0 = __rsvelte_component(Component);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
      prop: () => {
        const foo = items[0];
        (foo);
        return __rsvelte_snippet_return;
      },
    });
    const { prop } = __rsvelte_component_props(__rsvelte_component_0);
    const foo = items.length;
    (foo);
    {
      const __rsvelte_component_0 = __rsvelte_component(Component);
      __rsvelte_component_0(__rsvelte_internals(), {
        prop: () => {
          (foo);
          return __rsvelte_snippet_return;
        },
      });
      const { prop } = __rsvelte_component_props(__rsvelte_component_0);
    }
  }
};
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
