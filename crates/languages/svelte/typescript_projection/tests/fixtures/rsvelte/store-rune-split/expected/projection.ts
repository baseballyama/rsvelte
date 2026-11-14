;

	const state = { a: 1 };;let $state = __rsvelte_store_get(state);


;


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
const StoreRuneSplit__SvelteComponent_ = __rsvelte_export_component();
export default StoreRuneSplit__SvelteComponent_;
