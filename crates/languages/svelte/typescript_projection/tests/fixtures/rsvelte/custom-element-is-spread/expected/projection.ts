;
let props = $props();
;

async () => {
  {
    svelteHTML.createElement("button", {
      "is": "x-button",
    });
  }
  {
    svelteHTML.createElement("button", {
      "is": "x-button",
      ...(props),
    });
  }
};
const CustomElementIsSpread__SvelteComponent_ = __rsvelte_export_component<any, {}, "">();
type CustomElementIsSpread__SvelteComponent_ = ReturnType<typeof CustomElementIsSpread__SvelteComponent_>;
export default CustomElementIsSpread__SvelteComponent_;
