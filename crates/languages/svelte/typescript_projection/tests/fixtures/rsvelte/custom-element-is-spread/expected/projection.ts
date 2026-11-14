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
const CustomElementIsSpread__SvelteComponent_ = __rsvelte_export_component();
export default CustomElementIsSpread__SvelteComponent_;
