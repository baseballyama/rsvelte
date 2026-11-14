;

	const state = { a: 1 };;let $state!: __rsvelte_store_value<typeof state>;

	let count = $state(0);

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
    (state.a);
  }
};
const StoreRuneInstance__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type StoreRuneInstance__SvelteComponent_ = ReturnType<typeof StoreRuneInstance__SvelteComponent_>;
export default StoreRuneInstance__SvelteComponent_;
