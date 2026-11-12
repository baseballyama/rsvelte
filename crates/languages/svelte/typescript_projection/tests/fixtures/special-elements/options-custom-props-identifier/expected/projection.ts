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
const OptionsCustomPropsIdentifier__SvelteComponent_ = __rsvelte_export_component<any, {}, "">();
type OptionsCustomPropsIdentifier__SvelteComponent_ = ReturnType<typeof OptionsCustomPropsIdentifier__SvelteComponent_>;
export default OptionsCustomPropsIdentifier__SvelteComponent_;
