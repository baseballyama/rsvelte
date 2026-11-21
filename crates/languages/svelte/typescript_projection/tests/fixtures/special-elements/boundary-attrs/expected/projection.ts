;
function $$render() {
  function onerror(error, reset) { console.log(error); } function failed() {}
;

  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        onerror,
        failed,
      });
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const BoundaryAttrs__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryAttrs__SvelteComponent_>} BoundaryAttrs__SvelteComponent_ */
export default BoundaryAttrs__SvelteComponent_;
