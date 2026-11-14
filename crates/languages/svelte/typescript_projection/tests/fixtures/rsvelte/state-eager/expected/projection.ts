;

	let props = $props();
	let n = $state(0);
	const value = $derived(props.number ?? 0);
	const e = $state.eager(n);
	function f() { return $state.eager(n) + 1; }

;

async () => {
  {
    svelteHTML.createElement("div", {});
    (value);
  }
  {
    svelteHTML.createElement("div", {});
    ($state.eager(value));
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => n++,
    });
    (e);
    (f());
    ($state.eager(n));
  }
};
const StateEager__SvelteComponent_ = __rsvelte_export_component<any, {}, "">();
type StateEager__SvelteComponent_ = ReturnType<typeof StateEager__SvelteComponent_>;
export default StateEager__SvelteComponent_;
