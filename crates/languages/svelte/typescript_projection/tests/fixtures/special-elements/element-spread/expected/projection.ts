;
let tag = $state("div"); let attrs = $state({ id: "test" });
;

async () => {
  {
    svelteHTML.createElement(tag, {
      ...(attrs),
    });
  }
};
const ElementSpread__SvelteComponent_ = __rsvelte_export_component();
export default ElementSpread__SvelteComponent_;
