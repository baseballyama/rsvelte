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
const ElementSpread__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ElementSpread__SvelteComponent_ = ReturnType<typeof ElementSpread__SvelteComponent_>;
export default ElementSpread__SvelteComponent_;
