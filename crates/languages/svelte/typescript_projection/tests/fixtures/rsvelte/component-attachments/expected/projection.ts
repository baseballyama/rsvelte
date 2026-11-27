;
import C from './C.svelte';;

;

function $$render() {
  
	
	let x = $state(1);
	let /** @typedef {{ D: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { D } = $props();
	const a = (n) => {};

;

  async () => {
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        [Symbol("@attach")]: a,
      });
    }
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        "a": 1,
        [Symbol("@attach")]: (n) => console.log(n, x),
        "b": x,
        [Symbol("@attach")]: a,
      });
    }
    {
      __rsvelte_component(D)(__rsvelte_internals(), {
        children: __rsvelte_children,
        [Symbol("@attach")]: a,
      });
      D;
    }
    {
      __rsvelte_component(D)(__rsvelte_internals(), {
        [Symbol("@attach")]: a,
      });
    }
    if (x) {
      {
        __rsvelte_component(C)(__rsvelte_internals(), {
          ...({ y: 1 }),
          [Symbol("@attach")]: a,
        });
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => x++,
      });
    }
    {
      __rsvelte_component(C)(__rsvelte_internals(), {
        [Symbol("@attach")]: x > 1 ? a : null,
        [Symbol("@attach")]: (n) => a(n, x),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ComponentAttachments__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ComponentAttachments__SvelteComponent_>} ComponentAttachments__SvelteComponent_ */
export default ComponentAttachments__SvelteComponent_;
