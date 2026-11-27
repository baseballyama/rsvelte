;
function $$render() {
  
	let /** @typedef {{ load: any, other: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { load, other } = $props();
	let count = $state(0);

;

  async () => {
    {
      {
        svelteHTML.createElement("p", {});
        count;
      }
      try {
        const __rsvelte_awaited = await (load(count));
        {
          const value = __rsvelte_awaited;
          {
            svelteHTML.createElement("p", {});
            value;
          }
        }
      } catch (__rsvelte_error) {
        const error = __rsvelte_untyped_prop();
        {
          svelteHTML.createElement("p", {});
          error.message;
        }
      }
    }
    {
      const __rsvelte_awaited = await (other);
      {
        const { name, size = 1 } = __rsvelte_awaited;
        {
          svelteHTML.createElement("b", {});
          name;
          size;
        }
      }
    }
    {
      try {
        await (other);
      } catch (__rsvelte_error) {
        const e = __rsvelte_untyped_prop();
        {
          svelteHTML.createElement("i", {});
          e;
        }
      }
    }
    {
      svelteHTML.createElement("div", {});
      {
        {
          svelteHTML.createElement("span", {});
        }
        await (other);
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const AwaitBlock__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof AwaitBlock__SvelteComponent_>} AwaitBlock__SvelteComponent_ */
export default AwaitBlock__SvelteComponent_;
