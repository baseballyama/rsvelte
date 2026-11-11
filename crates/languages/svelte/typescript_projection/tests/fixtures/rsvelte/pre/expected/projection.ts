;

	let text = $state('hi');

;

async () => {
  {
    svelteHTML.createElement("pre", {});
    (text);
  }
  {
    svelteHTML.createElement("pre", {});
  }
  {
    svelteHTML.createElement("pre", {});
    {
      svelteHTML.createElement("code", {});
      (text);
    }
  }
  {
    svelteHTML.createElement("button", {
      "type": "button",
      "onclick": () => (text += '!'),
    });
  }
};
const Pre__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Pre__SvelteComponent_ = ReturnType<typeof Pre__SvelteComponent_>;
export default Pre__SvelteComponent_;
