;

	let active = $state(false);
	let count = $state(0);
	let theme = $state('light');
	const flag = true;

	function even(n) {
		return n % 2 === 0;
	}

;

() => {
  {
    svelteHTML.createElement("div", {});
    (active);
  }
  {
    svelteHTML.createElement("div", {
      class: "panel",
    });
    (active);
    (count > 3);
  }
  {
    svelteHTML.createElement("div", {
      class: theme,
    });
    (!active);
  }
  {
    svelteHTML.createElement("div", {});
    (even(count));
    (!even(count));
  }
  {
    svelteHTML.createElement("div", {});
    (flag);
  }
  {
    svelteHTML.createElement("div", {
      class: `a ${theme}`,
    });
    (active);
  }
  {
    svelteHTML.createElement("button", {
      onclick: () => count++,
    });
    (count);
  }
  {
    svelteHTML.createElement("button", {
      onclick: () => (active = !active),
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
