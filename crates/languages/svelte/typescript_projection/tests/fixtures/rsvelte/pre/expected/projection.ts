;

	let text = $state('hi');

;

() => {
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
      type: "button",
      onclick: () => (text += '!'),
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
