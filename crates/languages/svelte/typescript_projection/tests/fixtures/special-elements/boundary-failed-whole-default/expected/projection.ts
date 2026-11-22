;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({message}={message:"Unknown"},reset) => {
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
export const BoundaryFailedWholeDefault__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedWholeDefault__SvelteComponent_>} BoundaryFailedWholeDefault__SvelteComponent_ */
export default BoundaryFailedWholeDefault__SvelteComponent_;
