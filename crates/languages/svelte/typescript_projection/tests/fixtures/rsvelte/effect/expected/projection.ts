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
const Effect__SvelteComponent_ = __rsvelte_export_component();
export default Effect__SvelteComponent_;
