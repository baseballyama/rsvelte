;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {});
    }
    {
      svelteHTML.createElement("svelte:boundary", {});
      {
        svelteHTML.createElement("svelte:boundary", {});
        {
          svelteHTML.createElement("p", {});
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const BoundaryNested__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryNested__SvelteComponent_>} BoundaryNested__SvelteComponent_ */
export default BoundaryNested__SvelteComponent_;
