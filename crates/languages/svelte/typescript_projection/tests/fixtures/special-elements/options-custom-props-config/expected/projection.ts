;
function $$render() {
  let /** @typedef {{ enabled?: boolean, count: any }} $$ComponentProps *//** @type {$$ComponentProps} */ {enabled=false,count}= $props();
;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomPropsConfig__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomPropsConfig__SvelteComponent_>} OptionsCustomPropsConfig__SvelteComponent_ */
export default OptionsCustomPropsConfig__SvelteComponent_;
