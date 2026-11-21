;
function $$render() {
  
	let unused = 1;
	/** @type {typeof __rsvelte_public_props0} */ let { label } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    label: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("button", {});
      label;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const LintCases__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof LintCases__SvelteComponent_>} LintCases__SvelteComponent_ */
export default LintCases__SvelteComponent_;
