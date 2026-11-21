;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { items } = $props();

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
            foo;
          };
          return __rsvelte_snippet_return;
        },
      });
      const { prop } = __rsvelte_component_props(__rsvelte_component_0);
      prop;
      const foo = items.length;
      foo;
      {
        const __rsvelte_component_0 = __rsvelte_component(Component);
        __rsvelte_component_0(__rsvelte_internals(), {
          prop: () => {
            async () => {
              foo;
            };
            return __rsvelte_snippet_return;
          },
        });
        const { prop } = __rsvelte_component_props(__rsvelte_component_0);
        prop;
        Component;
      }
      Component;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ConstBesideSnippet__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ConstBesideSnippet__SvelteComponent_>} ConstBesideSnippet__SvelteComponent_ */
export default ConstBesideSnippet__SvelteComponent_;
