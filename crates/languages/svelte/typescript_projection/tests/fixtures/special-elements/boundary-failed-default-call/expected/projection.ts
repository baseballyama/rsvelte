;
function $$render() {
  function fallback(){return "Unknown"}
;

  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({message=fallback()},reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              message;
            }
          };
          return __rsvelte_snippet_return;
        },
      });
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const BoundaryFailedDefaultCall__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedDefaultCall__SvelteComponent_>} BoundaryFailedDefaultCall__SvelteComponent_ */
export default BoundaryFailedDefaultCall__SvelteComponent_;
