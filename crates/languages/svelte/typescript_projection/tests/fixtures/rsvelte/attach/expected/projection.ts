;

	let count = $state(0);

	function tooltip(node) {
		node.title = 'hi';
		return () => {
			node.title = '';
		};
	}

	function color(c) {
		return (node) => {
			node.style.color = c;
		};
	}

;

async () => {
  {
    svelteHTML.createElement("div", {
      [Symbol("@attach")]: tooltip,
    });
  }
  {
    svelteHTML.createElement("p", {
      [Symbol("@attach")]: color(count > 0 ? 'red' : 'blue'),
    });
    (count);
  }
  {
    svelteHTML.createElement("button", {
      [Symbol("@attach")]: (node) => node.focus(),
      "onclick": () => count++,
    });
  }
  {
    svelteHTML.createElement("span", {
      [Symbol("@attach")]: tooltip,
      [Symbol("@attach")]: color('green'),
    });
  }
};
const Attach__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Attach__SvelteComponent_>} */ (Attach__SvelteComponent_);
