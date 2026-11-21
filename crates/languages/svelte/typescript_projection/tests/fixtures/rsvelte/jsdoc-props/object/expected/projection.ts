;
function $$render() {
  
	// @ts-check
	/** @typedef {{ n: string }}  $$ComponentProps */ /** @type {$$ComponentProps} */
	let { n = 1, extra } = $props();

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      n;
      extra;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const Object__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Object__SvelteComponent_>} Object__SvelteComponent_ */
export default Object__SvelteComponent_;
