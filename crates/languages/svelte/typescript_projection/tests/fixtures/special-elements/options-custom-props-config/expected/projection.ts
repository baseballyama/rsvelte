;
let {enabled=false,count}: typeof __rsvelte_public_props0= $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  count: __rsvelte_untyped_prop(),
}, {
  enabled: false,
}, false);
() => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": {tag:"my-element",props:{enabled:{reflect:true},count:{type:"Number",attribute:"data-count"}}},
    });
  }
  {
    svelteHTML.createElement("p", {});
    (enabled);
    (count);
  }
};
const OptionsCustomPropsConfig__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type OptionsCustomPropsConfig__SvelteComponent_ = ReturnType<typeof OptionsCustomPropsConfig__SvelteComponent_>;
export default OptionsCustomPropsConfig__SvelteComponent_;
