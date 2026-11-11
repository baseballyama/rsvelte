;

	let { open = $bindable(), w = $bindable() }: typeof __rsvelte_public_props0 = $props();
	let t = $state(0);
	let p = $state(true);
	let v = $state(1);
	let files = $state();
	let f = $state(false);
	let rect = $state();
	let h = $state(0);
	let html = $state('');
	let ind = $state(false);
	let d = $state(0);
	let text = $state('');
	let ty = $state('text');
	function act() {}

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  open: __rsvelte_untyped_prop(),
  w: __rsvelte_untyped_prop(),
}, false);
async () => {
  {
    const __rsvelte_element0 = svelteHTML.createElement("video", {
      "bind:currentTime": t,
      "bind:paused": p,
      "bind:volume": v,
      "bind:videoWidth": w,
    });
    () => {
      // @ts-ignore
      t = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      p = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
    d = __rsvelte_element0.duration;
    () => {
      // @ts-ignore
      w = __rsvelte_untyped_prop();
    };
    rect = null as import('svelte/elements').SvelteMediaTimeRange[];
  }
  {
    const __rsvelte_element0 = svelteHTML.createElement("audio", {
      "bind:muted": p,
      "bind:playbackRate": v,
    });
    () => {
      // @ts-ignore
      p = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
    f = __rsvelte_element0.seeking;
    f = __rsvelte_element0.ended;
    h = __rsvelte_element0.readyState;
    rect = null as import('svelte/elements').SvelteMediaTimeRange[];
    rect = null as import('svelte/elements').SvelteMediaTimeRange[];
  }
  {
    svelteHTML.createElement("details", {
      "bind:open": open,
    });
    () => {
      // @ts-ignore
      open = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("details", {
      "bind:open": p,
    });
    () => {
      // @ts-ignore
      p = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": "file",
      "bind:files": files,
    });
    () => {
      // @ts-ignore
      files = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": "file",
      "bind:value": text,
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "bind:focused": f,
    });
    () => {
      // @ts-ignore
      f = __rsvelte_untyped_prop();
    };
  }
  {
    const __rsvelte_element0 = svelteHTML.createElement("div", {});
    w = __rsvelte_element0.clientWidth;
    h = __rsvelte_element0.offsetHeight;
    rect = null as DOMRectReadOnly;
  }
  {
    svelteHTML.createElement("div", {
      "contenteditable": true,
      "bind:innerHTML": html,
    });
    () => {
      // @ts-ignore
      html = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("p", {
      "contenteditable": "true",
      "bind:textContent": text,
      "bind:innerText": text,
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "bind:indeterminate": ind,
      "bind:checked": f,
    });
    () => {
      // @ts-ignore
      ind = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      f = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": ty,
      "bind:value": text,
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "bind:value": text,
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
  }
  {
    const __rsvelte_element0 = svelteHTML.createElement("img", {
      "alt": "",
    });
    w = __rsvelte_element0.naturalWidth;
  }
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(act(svelteHTML.mapElementTag("input")));
    svelteHTML.createElement("input", __sveltets_2_union(__rsvelte_action0), {
      "bind:value": text,
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "bind:value": w,
    });
    () => {
      // @ts-ignore
      w = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "bind:value": __rsvelte_get_set(() => text, (v) => (text = v)),
    });
  }
  {
    svelteHTML.createElement("select", {
      "bind:value": text,
      ...({}),
    });
    () => {
      // @ts-ignore
      text = __rsvelte_untyped_prop();
    };
    {
      svelteHTML.createElement("option", {});
    }
  }
};
const BindElements__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "open" | "w">();
type BindElements__SvelteComponent_ = ReturnType<typeof BindElements__SvelteComponent_>;
export default BindElements__SvelteComponent_;
