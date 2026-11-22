;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({message, ...rest}, reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              message;
              rest.name;
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
export const BoundaryFailedRest__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedRest__SvelteComponent_>} BoundaryFailedRest__SvelteComponent_ */
export default BoundaryFailedRest__SvelteComponent_;
