;

	import C from './C.svelte';
	let k = $state(1);

;

async () => {
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    {
      const {
        item,
        "index": i,
        "pair": { a, b: [c], ...rest },
      } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
      {
        for (let [, x] of __rsvelte_each(item)) {
          {
            svelteHTML.createElement("p", {
              "onclick": () => k++,
            });
            (x);
            (i);
            (a);
            (c);
            (rest.d);
            (k);
          }
        }
      }
      {
        const {
          x,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["named"];
        svelteHTML.createElement("div", {
          "slot": "named",
        });
        (x);
      }
      {
        const {
          "y": { z },
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["f"];
        svelteHTML.createElement("svelte:fragment", {
          "slot": "f",
        });
        (z);
      }
      {
        const {
          w,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["comp"];
        __rsvelte_component(C)(__rsvelte_internals(), {
          children: __rsvelte_children,
          "slot": "comp",
          "foo": w,
        });
        (w);
      }
      {
        const {
          v,
        } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["consts"];
        svelteHTML.createElement("p", {
          "slot": "consts",
        });
        const twice = v * 2;
        (twice);
      }
    }
  }
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    {
      const {
        v,
      } = __rsvelte_instance(__rsvelte_component_0).$$slot_def.default;
      svelteHTML.createElement("svelte:fragment", {});
      (v);
    }
  }
  {
    const __rsvelte_component_0 = __rsvelte_component(C);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
    });
    {
      const {
        u,
      } = __rsvelte_instance(__rsvelte_component_0).$$slot_def["default"];
      svelteHTML.createElement("svelte:fragment", {
        "slot": "default",
      });
      (u);
    }
  }
};
const LetDirectives__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type LetDirectives__SvelteComponent_ = ReturnType<typeof LetDirectives__SvelteComponent_>;
export default LetDirectives__SvelteComponent_;
