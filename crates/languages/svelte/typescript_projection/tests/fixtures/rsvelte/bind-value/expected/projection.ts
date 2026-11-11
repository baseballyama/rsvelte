;

	let name = $state('world');

;

() => {
  {
    svelteHTML.createElement("input", {
      "bind:value": name,
    });
    () => {
      // @ts-ignore
      name = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("p", {});
    (name);
  }
};
const BindValue__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindValue__SvelteComponent_ = ReturnType<typeof BindValue__SvelteComponent_>;
export default BindValue__SvelteComponent_;
