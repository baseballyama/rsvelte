;
let {tag, active} = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  tag: __rsvelte_untyped_prop(),
  active: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement(tag, {
      "class": "base",
    });
    (active());
  }
};
const ElementClassMemo__SvelteComponent_ = __rsvelte_export_component();
export default ElementClassMemo__SvelteComponent_;
