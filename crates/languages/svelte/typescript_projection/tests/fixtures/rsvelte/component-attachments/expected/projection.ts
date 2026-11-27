;
import C from './C.svelte';;

;

function $$render() {
  
	
	let x = $state(1);
	let /** @type {typeof __rsvelte_public_props0} */ { D } = $props();
	const a = (n) => {};

;

  const __rsvelte_public_props0 = __rsvelte_props({
    D: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      new (__rsvelte_component(C))(__rsvelte_internals(), {
        props: {
          [Symbol("@attach")]: a,
        },
      });
    }
    {
      new (__rsvelte_component(C))(__rsvelte_internals(), {
        props: {
          "a": 1,
          [Symbol("@attach")]: (n) => console.log(n, x),
          "b": x,
          [Symbol("@attach")]: a,
        },
      });
    }
    {
      new (__rsvelte_component(D))(__rsvelte_internals(), {
        props: {
          children: __rsvelte_children,
          [Symbol("@attach")]: a,
        },
      });
      D;
    }
    {
      new (__rsvelte_component(D))(__rsvelte_internals(), {
        props: {
          [Symbol("@attach")]: a,
        },
      });
    }
    if (x) {
      {
        new (__rsvelte_component(C))(__rsvelte_internals(), {
          props: {
            ...({ y: 1 }),
            [Symbol("@attach")]: a,
          },
        });
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => x++,
      });
    }
    {
      new (__rsvelte_component(C))(__rsvelte_internals(), {
        props: {
          [Symbol("@attach")]: x > 1 ? a : null,
          [Symbol("@attach")]: (n) => a(n, x),
        },
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const ComponentAttachments__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ComponentAttachments__SvelteComponent_>} ComponentAttachments__SvelteComponent_ */
export default ComponentAttachments__SvelteComponent_;
