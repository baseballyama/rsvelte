;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        pending: () => {
          async () => {
            {
              svelteHTML.createElement("p", {});
            }
          };
          return __rsvelte_snippet_return;
        },
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
export const BoundarySnippets__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundarySnippets__SvelteComponent_>} BoundarySnippets__SvelteComponent_ */
export default BoundarySnippets__SvelteComponent_;
