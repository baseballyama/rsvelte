;
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
const BindValueBeforeABadTarget__SvelteComponent_ = __rsvelte_export_component();
export default BindValueBeforeABadTarget__SvelteComponent_;
