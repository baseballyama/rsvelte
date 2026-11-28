;
function $$render() {
  
	let /** @typedef {{ items: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { items } = $props();

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(Component);
      const __rsvelte_element0 = new (__rsvelte_component_0)(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
          prop: () => {
            async () => {
              const foo = items[0];
              foo;
            };
            return __rsvelte_snippet_return;
          },
        },
      });
      const { prop } = __rsvelte_component_props(__rsvelte_component_0);
      const foo = items.length;
      foo;
      {
        const __rsvelte_component_0 = __rsvelte_component(Component);
        const __rsvelte_element0 = new (__rsvelte_component_0)(__rsvelte_internals(), {
          props: {
            prop: () => {
              async () => {
                foo;
              };
              return __rsvelte_snippet_return;
            },
          },
        });
        const { prop } = __rsvelte_component_props(__rsvelte_component_0);
        Component;
      }
      Component;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ConstBesideSnippet__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ConstBesideSnippet__SvelteComponent_>} ConstBesideSnippet__SvelteComponent_ */
export default ConstBesideSnippet__SvelteComponent_;
