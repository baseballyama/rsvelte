;

	let a = $state(1);
	let b = $derived(a * 2);
	$inspect(a, b);
	$inspect(a).with(console.trace);
	function f() {
		$inspect.trace('f');
		$inspect(b);
		return a;
	}

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => { $inspect(a); a++; },
    });
    (f());
  }
};
const InspectDropped__SvelteComponent_ = __rsvelte_export_component();
export default InspectDropped__SvelteComponent_;
