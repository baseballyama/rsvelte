;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({cause:{message}},reset) => {
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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const BoundaryFailedNested__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BoundaryFailedNested__SvelteComponent_>} BoundaryFailedNested__SvelteComponent_ */
export default BoundaryFailedNested__SvelteComponent_;
