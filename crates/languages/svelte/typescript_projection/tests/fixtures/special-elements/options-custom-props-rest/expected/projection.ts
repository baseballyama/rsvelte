;
/** @type {typeof __rsvelte_public_props0} */ let {value,...rest}=$props()
;

const __rsvelte_public_props0 = __rsvelte_props({
  value: __rsvelte_untyped_prop(),
}, {}, true);
async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": "my-element",
    });
  }
  {
    svelteHTML.createElement("p", {});
    (value);
    (rest.other);
  }
};
const OptionsCustomPropsRest__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomPropsRest__SvelteComponent_>} */ (OptionsCustomPropsRest__SvelteComponent_);
