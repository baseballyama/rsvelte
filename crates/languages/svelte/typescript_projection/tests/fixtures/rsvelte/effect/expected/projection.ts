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

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => n++,
    });
    (n);
    (f());
  }
};
const Effect__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Effect__SvelteComponent_>} */ (Effect__SvelteComponent_);
