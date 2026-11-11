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

() => {
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
const Attach__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Attach__SvelteComponent_ = ReturnType<typeof Attach__SvelteComponent_>;
export default Attach__SvelteComponent_;
