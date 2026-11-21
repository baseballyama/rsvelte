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
      });
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const BoundaryPendingSnippet__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryPendingSnippet__SvelteComponent_>} BoundaryPendingSnippet__SvelteComponent_ */
export default BoundaryPendingSnippet__SvelteComponent_;
