;
function $$render() {
  
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
      count;
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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const Attach__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Attach__SvelteComponent_>} Attach__SvelteComponent_ */
export default Attach__SvelteComponent_;
