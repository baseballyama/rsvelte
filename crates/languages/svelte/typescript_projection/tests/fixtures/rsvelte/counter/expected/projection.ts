;

	let count = $state(0);

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
  }
};
const Counter__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Counter__SvelteComponent_ = ReturnType<typeof Counter__SvelteComponent_>;
export default Counter__SvelteComponent_;
