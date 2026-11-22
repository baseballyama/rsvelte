;
function $$render() {
  async () => {
    {
      for (let [, n] of __rsvelte_each([1, 2, 3])) {
        n;
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const EachStatic__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof EachStatic__SvelteComponent_>} EachStatic__SvelteComponent_ */
export default EachStatic__SvelteComponent_;
