;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:value": value,
        "bind:checked": checked,
      });
      () => {
        // @ts-ignore
        value = __rsvelte_untyped_prop();
      };
      () => {
        // @ts-ignore
        checked = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const BindValueBeforeABadTarget__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof BindValueBeforeABadTarget__SvelteComponent_>} BindValueBeforeABadTarget__SvelteComponent_ */
export default BindValueBeforeABadTarget__SvelteComponent_;
