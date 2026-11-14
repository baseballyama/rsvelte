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
const BindCheckedOnARadio__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindCheckedOnARadio__SvelteComponent_ = ReturnType<typeof BindCheckedOnARadio__SvelteComponent_>;
export default BindCheckedOnARadio__SvelteComponent_;
