;

	import C from "./C.svelte";
	let k = $state(1);

;

async () => {
  {
    __rsvelte_component(C)(__rsvelte_internals(), {});
    {
      svelteHTML.createElement("p", {
        "slot": "a",
      });
      const twice = k * 2;
      (twice);
    }
    C;
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => k++,
    });
  }
};
const SlotElementConst__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SlotElementConst__SvelteComponent_ = ReturnType<typeof SlotElementConst__SvelteComponent_>;
export default SlotElementConst__SvelteComponent_;
