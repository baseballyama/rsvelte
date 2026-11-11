;

	import C from './C.svelte';
	let x = $state(1);

;

async () => {
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
      foo: () => {
        async () => {
        };
        return __rsvelte_snippet_return;
      },
    });
    const { foo } = __rsvelte_component_props(__rsvelte_component_0);
    {
      svelteHTML.createElement("div", {
        "slot": "a",
      });
      (x);
    }
    (x);
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        "slot": "1",
        "a": x,
      });
    }
    {
      svelteHTML.createElement("span", {
        "slot": "0",
      });
      (x);
    }
  }
  {
    __rsvelte_component(C)(__rsvelte_internals(), {});
    {
      svelteHTML.createElement("svelte:fragment", {
        "slot": "b",
      });
      {
        svelteHTML.createElement("span", {});
        (x);
      }
    }
    {
      svelteHTML.createElement("svelte:fragment", {
        "slot": "c",
      });
      {
        svelteHTML.createElement("svg", {});
        {
          svelteHTML.createElement("rect", {});
        }
      }
    }
  }
  {
    __rsvelte_component(C)(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    {
      svelteHTML.createElement("svelte:fragment", {});
      (x);
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => x++,
    });
  }
};
const NamedSlots__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type NamedSlots__SvelteComponent_ = ReturnType<typeof NamedSlots__SvelteComponent_>;
export default NamedSlots__SvelteComponent_;
