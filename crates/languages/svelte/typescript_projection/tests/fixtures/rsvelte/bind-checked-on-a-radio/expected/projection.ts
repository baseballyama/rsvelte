;

	let v = $state(false);

;

async () => {
  {
    svelteHTML.createElement("input", {
      "type": "radio",
      "bind:checked": v,
    });
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
  }
};
const BindCheckedOnARadio__SvelteComponent_ = __rsvelte_export_component();
export default BindCheckedOnARadio__SvelteComponent_;
