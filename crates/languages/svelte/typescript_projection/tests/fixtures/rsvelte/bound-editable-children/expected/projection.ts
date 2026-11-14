;

	let value = $state(1);
	let other = $state('x');

;

async () => {
  {
    svelteHTML.createElement("div", {
      "contenteditable": "true",
      "bind:innerText": value,
    });
    () => {
      // @ts-ignore
      value = __rsvelte_untyped_prop();
    };
    (value);
  }
  {
    svelteHTML.createElement("div", {
      "contenteditable": true,
      "bind:innerHTML": other,
    });
    () => {
      // @ts-ignore
      other = __rsvelte_untyped_prop();
    };
    const raw = (): ReturnType<import('svelte').Snippet> => {
      async () => {
        {
          svelteHTML.createElement("p", {});
          (value);
          (other);
        }
      };
      return __rsvelte_snippet_return;
    };
    __rsvelte_ensure_snippet(raw());
    {
      svelteHTML.createElement("span", {});
      (other);
    }
  }
  {
    svelteHTML.createElement("div", {
      "contenteditable": "plaintext-only",
      "bind:textContent": other,
    });
    () => {
      // @ts-ignore
      other = __rsvelte_untyped_prop();
    };
    (other);
  }
  {
    svelteHTML.createElement("p", {});
    (value);
  }
};
const BoundEditableChildren__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundEditableChildren__SvelteComponent_ = ReturnType<typeof BoundEditableChildren__SvelteComponent_>;
export default BoundEditableChildren__SvelteComponent_;
