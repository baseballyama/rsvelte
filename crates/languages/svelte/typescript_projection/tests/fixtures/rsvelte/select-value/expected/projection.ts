;

	let picked = $state(1);
	let label = $state('two');
	let fallback = 'b';

;

() => {
  {
    svelteHTML.createElement("select", {
      value: picked,
      onchange: (e) => (picked = +e.currentTarget.value),
    });
    {
      svelteHTML.createElement("option", {
        value: 1,
      });
    }
    {
      svelteHTML.createElement("option", {
        value: picked + 1,
      });
      (label);
    }
    {
      svelteHTML.createElement("option", {});
      (label);
    }
  }
  {
    svelteHTML.createElement("select", {
      defaultValue: fallback,
    });
    {
      svelteHTML.createElement("option", {
        value: "a",
      });
    }
    {
      svelteHTML.createElement("option", {
        value: "b",
        selected: true,
      });
    }
  }
  {
    svelteHTML.createElement("select", {});
    {
      svelteHTML.createElement("option", {});
    }
    {
      svelteHTML.createElement("option", {
        disabled: true,
        value: "",
      });
    }
  }
  {
    svelteHTML.createElement("button", {
      type: "button",
      onclick: () => (label += '!'),
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
