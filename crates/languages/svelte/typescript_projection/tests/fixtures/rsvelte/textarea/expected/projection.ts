;

	let text = $state('');
	let { p = $bindable() }: typeof __rsvelte_public_props0 = $props();
	let rest = {};

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  p: __rsvelte_untyped_prop(),
}, false);
() => {
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
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "p">();
