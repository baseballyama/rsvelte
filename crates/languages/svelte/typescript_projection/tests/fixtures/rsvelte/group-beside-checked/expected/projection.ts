;
let g = $state(); let t = $state('a'); let { p }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  p: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("input", {
      "type": "radio",
      "value": t,
      "checked": t === g,
    });
    g = __rsvelte_untyped_prop();
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "value": t,
      "checked": t === g,
      ...(p),
    });
    g = __rsvelte_untyped_prop();
  }
  {
    svelteHTML.createElement("input", {
      "type": "checkbox",
      "checked": true,
    });
    g = __rsvelte_untyped_prop();
  }
};
const GroupBesideChecked__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type GroupBesideChecked__SvelteComponent_ = ReturnType<typeof GroupBesideChecked__SvelteComponent_>;
export default GroupBesideChecked__SvelteComponent_;
