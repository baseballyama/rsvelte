;

	let active = $state(false);
	let size = $state('small');
	let tone = $state(null);
	const base = 'card';

	function variant(v) {
		return `btn-${v}`;
	}

;

() => {
  {
    svelteHTML.createElement("div", {
      class: size,
    });
  }
  {
    svelteHTML.createElement("div", {
      class: `box ${size} rounded`,
    });
  }
  {
    svelteHTML.createElement("div", {
      class: size,
    });
  }
  {
    svelteHTML.createElement("div", {
      class: { active, large: size === 'large' },
    });
  }
  {
    svelteHTML.createElement("div", {
      class: ['item', active && 'is-active', tone],
    });
  }
  {
    svelteHTML.createElement("div", {
      class: base,
    });
  }
  {
    svelteHTML.createElement("div", {
      class: 'literal',
    });
  }
  {
    svelteHTML.createElement("div", {
      class: `t-${size}`,
    });
  }
  {
    svelteHTML.createElement("div", {
      class: variant(size),
    });
  }
  {
    svelteHTML.createElement("button", {
      onclick: () => (active = !active),
    });
  }
  {
    svelteHTML.createElement("button", {
      onclick: () => (size = size === 'small' ? 'large' : 'small'),
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
