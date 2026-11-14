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
    const raw = () => {
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
const BoundEditableChildren__SvelteComponent_ = __rsvelte_export_component();
export default BoundEditableChildren__SvelteComponent_;
