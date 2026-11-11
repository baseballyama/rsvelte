;

	let { items }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    const __rsvelte_component_0 = __rsvelte_component(Component);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
      prop: () => {
        async () => {
          const foo = items[0];
          (foo);
        };
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
          async () => {
            (foo);
          };
          return __rsvelte_snippet_return;
        },
      });
      const { prop } = __rsvelte_component_props(__rsvelte_component_0);
    }
  }
};
const ConstBesideSnippet__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type ConstBesideSnippet__SvelteComponent_ = ReturnType<typeof ConstBesideSnippet__SvelteComponent_>;
export default ConstBesideSnippet__SvelteComponent_;
