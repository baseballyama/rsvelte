;

	import C from "./C.svelte";
	let x = $state(1);

;

async () => {
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    {
      const {
        x,
      } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
      (x);
      {
        svelteHTML.createElement("p", {
          "slot": "a",
        });
        (x);
      }
      {
        const {
          y,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["b"];
        __rsvelte_component(C)(__rsvelte_internals(), {
          children: __rsvelte_children,
          "slot": "b",
        });
        (x);
        (y);
        C;
      }
    }
    C;
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => x++,
    });
  }
};
const LetScope__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type LetScope__SvelteComponent_ = ReturnType<typeof LetScope__SvelteComponent_>;
export default LetScope__SvelteComponent_;
