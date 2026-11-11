;
let tag = $state('div'); let c = $state('red'); let { p }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  p: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement(tag, {});
    __sveltets_2_ensureType(String, Number, c);
    __sveltets_2_ensureType(String, Number, "1px");
    __sveltets_2_ensureType(String, Number, c);
  }
  {
    svelteHTML.createElement(tag, {
      ...(p),
      "style": "a: b",
    });
    __sveltets_2_ensureType(String, Number, c);
  }
  {
    svelteHTML.createElement(tag, {
      "style": "margin: 0",
    });
    __sveltets_2_ensureType(String, Number, c);
  }
};
const DynamicElementSe__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type DynamicElementSe__SvelteComponent_ = ReturnType<typeof DynamicElementSe__SvelteComponent_>;
export default DynamicElementSe__SvelteComponent_;
