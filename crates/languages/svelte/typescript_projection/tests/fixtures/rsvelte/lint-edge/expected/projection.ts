;
function $$render() {
  
	type $$ComponentProps = { label: any }; let { label }: $$ComponentProps = $props();
	function f(a, b) {
		return b;
	}
	const g = (x = 1) => 0;
	let c = 0;
	c = c + 1;
	let d: number = 1;
	function h() {
		h();
	}
	f;
	g;

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "type": "",
      });
    }
    {
      svelteHTML.createElement("button", {
        "type": true,
      });
    }
    {
      svelteHTML.createElement("button", {
        "type": "&#98;utton",
      });
    }
    {
      svelteHTML.createElement("button", {
        "type": "foo",
      });
    }
    {
      svelteHTML.createElement("button", {
        "type": label,
      });
    }
    {
      svelteHTML.createElement("button", {
        "type": `a${label}`,
      });
    }
    {
      svelteHTML.createElement("button", {
        type,
      });
    }
  };
  return __rsvelte_export_component<$$ComponentProps, {}, "">();
}
const LintEdge__SvelteComponent_ = $$render();
type LintEdge__SvelteComponent_ = ReturnType<typeof LintEdge__SvelteComponent_>;
export default LintEdge__SvelteComponent_;
