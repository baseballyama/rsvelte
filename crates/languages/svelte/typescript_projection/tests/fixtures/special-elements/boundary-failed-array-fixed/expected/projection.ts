;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ([first,,third],reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              first;
              third;
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
export const BoundaryFailedArrayFixed__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedArrayFixed__SvelteComponent_>} BoundaryFailedArrayFixed__SvelteComponent_ */
export default BoundaryFailedArrayFixed__SvelteComponent_;
