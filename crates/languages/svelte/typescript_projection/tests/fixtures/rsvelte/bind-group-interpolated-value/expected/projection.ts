;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { p, q } = $props();
	let group = $state([]);
	let one = $state('');
	let checked = $state(false);
	let items = $state([1, 2]);
	let c = 'q';
	function f(x) {
		return x;
	}

;

  const __rsvelte_public_props0 = __rsvelte_props({
    p: __rsvelte_untyped_prop(),
    q: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": `${p}-${q}`,
      });
      group = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "radio",
        "value": `x${p}`,
      });
      one = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "radio",
        "value": `${f(p)}${q}`,
      });
      one = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": `${p}:${f(q)}`,
        "bind:checked": checked,
      });
      () => {
        // @ts-ignore
        checked = __rsvelte_untyped_prop();
      };
    }
    {
      for (let item of __rsvelte_each(items)) {
        let i = 1;
        {
          svelteHTML.createElement("input", {
            "type": "checkbox",
            "value": `${item}-${i}-${p}`,
          });
          group = __rsvelte_untyped_prop();
        }
      }
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": `a${c}`,
      });
      group = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": `it's ${c}`,
      });
      group = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": `say &quot;${c}&quot; \\ back`,
      });
      group = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": 'lit',
      });
      group = __rsvelte_untyped_prop();
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const BindGroupInterpolatedValue__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindGroupInterpolatedValue__SvelteComponent_>} BindGroupInterpolatedValue__SvelteComponent_ */
export default BindGroupInterpolatedValue__SvelteComponent_;
