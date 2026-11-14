;
let props=$props()
;

async () => {
  {
    svelteHTML.createElement("svelte:options", {
      "customelement": "my-element",
    });
  }
  {
    svelteHTML.createElement("p", {});
    (props.value);
  }
};
const OptionsCustomPropsIdentifier__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<any, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof OptionsCustomPropsIdentifier__SvelteComponent_>} */ (OptionsCustomPropsIdentifier__SvelteComponent_);
