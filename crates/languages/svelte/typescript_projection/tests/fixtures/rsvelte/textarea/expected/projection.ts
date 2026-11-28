;
function $$render() {
  
	let text = $state('');
	let /** @typedef {{ p?: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { p = $bindable() } = $props();
  p;

	let rest = {};

;

  async () => {
    {
      svelteHTML.createElement("textarea", {
        "bind:value": text,
      });
      () => {
        // @ts-ignore
        text = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("textarea", {
        "bind:value": p,
        "placeholder": "x",
      });
      () => {
        // @ts-ignore
        p = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("textarea", {
        "value": "a",
      });
    }
    {
      svelteHTML.createElement("textarea", {
        "value": text,
      });
    }
    {
      svelteHTML.createElement("textarea", {
        "value": "\nx",
      });
    }
    {
      svelteHTML.createElement("textarea", {});
    }
    {
      svelteHTML.createElement("textarea", {});
    }
    {
      svelteHTML.createElement("textarea", {
        ...(rest),
        "bind:value": text,
      });
      () => {
        // @ts-ignore
        text = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("textarea", {});
    }
    {
      svelteHTML.createElement("textarea", {
        "value": true,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "p">} */ (__rsvelte_export_component))();
}
export const Textarea__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Textarea__SvelteComponent_>} Textarea__SvelteComponent_ */
export default Textarea__SvelteComponent_;
