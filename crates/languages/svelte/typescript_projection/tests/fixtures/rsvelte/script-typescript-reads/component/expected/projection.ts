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
export const Component__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Component__SvelteComponent_>} Component__SvelteComponent_ */
export default Component__SvelteComponent_;
