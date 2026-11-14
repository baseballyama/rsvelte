;

	let picked = $state(1);
	let label = $state('two');
	let fallback = 'b';

;

async () => {
  {
    svelteHTML.createElement("select", {
      "value": picked,
      "onchange": (e) => (picked = +e.currentTarget.value),
    });
    {
      svelteHTML.createElement("option", {
        "value": 1,
      });
    }
    {
      svelteHTML.createElement("option", {
        "value": picked + 1,
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
      "defaultvalue": fallback,
    });
    {
      svelteHTML.createElement("option", {
        "value": "a",
      });
    }
    {
      svelteHTML.createElement("option", {
        "value": "b",
        "selected": true,
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
        "disabled": true,
        "value": "",
      });
    }
  }
  {
    svelteHTML.createElement("button", {
      "type": "button",
      "onclick": () => (label += '!'),
    });
  }
};
const SelectValue__SvelteComponent_ = __rsvelte_export_component();
export default SelectValue__SvelteComponent_;
