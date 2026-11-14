;
let name="a";const obj={get name(){return name;},set name(value){name=value;}};
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": obj.name,
    });
  }
};
const Getter__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Getter__SvelteComponent_>} */ (Getter__SvelteComponent_);
