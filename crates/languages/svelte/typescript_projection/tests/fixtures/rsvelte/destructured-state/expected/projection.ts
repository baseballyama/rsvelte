;

	export function make() {
		let { h, i = 1 } = $state(get());
		let [j] = $state.raw(get());
		return () => { h = 1; j = 2; return [h, i, j]; };
	}

;


	let { a, b: bb, c = 1, ...rest } = $state(get());
	let [one, two = 2, ...others] = $state([10, "Admin"]);
	const { d } = $state(get());
	let { e } = $state(obj);
	let [f] = $state(get());
	let { g } = $state.raw(get());

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => { a++; one = 3; bb = 1; rest.x; c++; others = []; f++; g = 1; },
    });
    (a);
    (bb);
    (c);
    (rest);
    (one);
    (two);
    (others);
    (d);
    (e);
    (f);
    (g);
  }
};
const DestructuredState__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DestructuredState__SvelteComponent_ = ReturnType<typeof DestructuredState__SvelteComponent_>;
export default DestructuredState__SvelteComponent_;
