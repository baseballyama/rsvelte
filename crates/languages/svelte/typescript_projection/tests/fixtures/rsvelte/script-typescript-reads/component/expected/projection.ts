;
function $$render() {
  
	class A {
		accessor x? = 1;
	}
	/** @typedef {{ name: string }}  $$ComponentProps */ /** @type {$$ComponentProps} */
	let { name } = $props();
	new A();

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      name;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
const Component__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Component__SvelteComponent_>} */ (Component__SvelteComponent_);
