;

	let n = $state(0);

	$effect(() => {
		console.log(n);
	});

	$effect.pre(() => console.log(n));

	function f() {
		$effect(() => {});
		return 1;
	}

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => n++,
    });
    (n);
    (f());
  }
};
const Effect__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Effect__SvelteComponent_ = ReturnType<typeof Effect__SvelteComponent_>;
export default Effect__SvelteComponent_;
