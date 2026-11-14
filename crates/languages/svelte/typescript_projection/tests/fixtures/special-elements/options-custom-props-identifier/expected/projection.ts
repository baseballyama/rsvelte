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
const OptionsCustomPropsIdentifier__SvelteComponent_ = __rsvelte_export_component();
export default OptionsCustomPropsIdentifier__SvelteComponent_;
