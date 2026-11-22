;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({message}, reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              message;
            }
            {
              svelteHTML.createElement("button", {
                "onclick": reset,
              });
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
export const BoundaryFailedObject__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedObject__SvelteComponent_>} BoundaryFailedObject__SvelteComponent_ */
export default BoundaryFailedObject__SvelteComponent_;
