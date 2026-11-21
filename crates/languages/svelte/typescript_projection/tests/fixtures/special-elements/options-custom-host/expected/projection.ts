;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let {}=$props();let host=$host()
;

  const __rsvelte_public_props0 = __rsvelte_props({}, {}, false);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      host;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomHost__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomHost__SvelteComponent_>} OptionsCustomHost__SvelteComponent_ */
export default OptionsCustomHost__SvelteComponent_;
