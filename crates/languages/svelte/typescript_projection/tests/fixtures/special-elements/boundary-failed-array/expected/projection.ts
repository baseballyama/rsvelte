;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ([first, ...rest], reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              first;
              rest.length;
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
export const BoundaryFailedArray__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedArray__SvelteComponent_>} BoundaryFailedArray__SvelteComponent_ */
export default BoundaryFailedArray__SvelteComponent_;
