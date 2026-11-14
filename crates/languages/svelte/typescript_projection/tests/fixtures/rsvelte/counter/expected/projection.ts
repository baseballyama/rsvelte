;

	let count = $state(0);

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
  }
};
const Counter__SvelteComponent_ = __rsvelte_export_component();
export default Counter__SvelteComponent_;
