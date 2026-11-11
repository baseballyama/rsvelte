;

	const state = { a: 1 };;let $state!: __rsvelte_store_value<typeof state>;


;


	let count = $state(0);

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
    (state.a);
  }
};
const StoreRuneSplit__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type StoreRuneSplit__SvelteComponent_ = ReturnType<typeof StoreRuneSplit__SvelteComponent_>;
export default StoreRuneSplit__SvelteComponent_;
