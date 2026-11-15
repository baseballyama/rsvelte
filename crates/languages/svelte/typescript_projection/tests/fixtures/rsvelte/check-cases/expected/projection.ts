;
type $$ComponentProps = { label: string };

;

function $$render() {
  
	let n: number = 'x';
	let { label }: $$ComponentProps = $props();
	let count = $state(0);
	let maybe: string | undefined = $state();

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "type": "button",
        "onclick": () => count.toUpperCase(),
      });
      (label.foo);
    }
    if (maybe) {
      {
        svelteHTML.createElement("p", {});
        (maybe.length);
      }
    } else {
      {
        svelteHTML.createElement("p", {});
        (maybe.length);
      }
    }
    {
      svelteHTML.createElement("p", {
        "title": `a${count.bar}b`,
      });
      (label.baz);
    }
  };
  return __rsvelte_export_component<$$ComponentProps, {}, "">();
}
const CheckCases__SvelteComponent_ = $$render();
type CheckCases__SvelteComponent_ = ReturnType<typeof CheckCases__SvelteComponent_>;
export default CheckCases__SvelteComponent_;
