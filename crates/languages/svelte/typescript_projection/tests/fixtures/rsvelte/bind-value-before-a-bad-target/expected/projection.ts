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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const BindValueBeforeABadTarget__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindValueBeforeABadTarget__SvelteComponent_>} */ (BindValueBeforeABadTarget__SvelteComponent_);
