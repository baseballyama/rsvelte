;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: (error, reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              error.message;
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
export const BoundaryFailedSnippet__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedSnippet__SvelteComponent_>} BoundaryFailedSnippet__SvelteComponent_ */
export default BoundaryFailedSnippet__SvelteComponent_;
