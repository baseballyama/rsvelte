;
function $$render() {
  
	class A {
		accessor x? = 1;
	}
	/** @type {{ name: string }} */
	/** @type {typeof __rsvelte_public_props0} */ let { name } = $props();
	new A();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    name: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("p", {});
      name;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const Component__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Component__SvelteComponent_>} */ (Component__SvelteComponent_);
