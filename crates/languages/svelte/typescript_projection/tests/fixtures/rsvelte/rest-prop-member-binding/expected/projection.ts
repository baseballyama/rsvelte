;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { p, ...rest } = $props();
	let obj = $state({});
	let k = 'x';
	let arr = [];
	let s = $state(0);
	let t;
	function f() {
		rest.w = 1;
		rest.u++;
		let y = rest.r;
		[rest.d] = arr;
		({ e: rest.e } = obj);
		rest.a.b = 2;
		[rest.d2, s] = arr;
		({ e: rest.e2, s } = obj);
		[t, s] = rest.i;
		t = rest.j;
		return rest.q;
	}

;

  const __rsvelte_public_props0 = __rsvelte_props({
    p: __rsvelte_untyped_prop(),
  }, {}, true);
  async () => {
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "bind:checked": rest.c,
      });
      () => {
        // @ts-ignore
        rest.c = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": "v",
      });
      rest.sel = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": rest.a.b,
      });
      () => {
        // @ts-ignore
        rest.a.b = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": obj[rest.k],
      });
      () => {
        // @ts-ignore
        obj[rest.k] = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": rest[k],
      });
      () => {
        // @ts-ignore
        rest[k] = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": rest.p,
      });
      () => {
        // @ts-ignore
        rest.p = __rsvelte_untyped_prop();
      };
    }
    {
      rest.el = svelteHTML.createElement("div", {});
    }
    {
      const __rsvelte_element0 = svelteHTML.createElement("div", {});
      rest.w2 = __rsvelte_element0.clientWidth;
    }
    {
      for (let [, item] of __rsvelte_each(arr)) {
        {
          svelteHTML.createElement("input", {
            "bind:value": rest.each,
          });
          () => {
            // @ts-ignore
            rest.each = __rsvelte_untyped_prop();
          };
        }
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => (rest.click = 1),
      });
      rest.t;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const RestPropMemberBinding__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RestPropMemberBinding__SvelteComponent_>} RestPropMemberBinding__SvelteComponent_ */
export default RestPropMemberBinding__SvelteComponent_;
