;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ {enabled=false,count}= $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    count: __rsvelte_untyped_prop(),
  }, {
    enabled: false,
  }, false);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": {tag:"my-element",props:{enabled:{reflect:true},count:{type:"Number",attribute:"data-count"}}},
      });
    }
    {
      svelteHTML.createElement("p", {});
      enabled;
      count;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomPropsConfig__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomPropsConfig__SvelteComponent_>} OptionsCustomPropsConfig__SvelteComponent_ */
export default OptionsCustomPropsConfig__SvelteComponent_;
