;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { ok } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    ok: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    if (ok) {
      {
        svelteHTML.createElement("p", {});
      }
    } else {
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const IfBlock__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof IfBlock__SvelteComponent_>} IfBlock__SvelteComponent_ */
export default IfBlock__SvelteComponent_;
