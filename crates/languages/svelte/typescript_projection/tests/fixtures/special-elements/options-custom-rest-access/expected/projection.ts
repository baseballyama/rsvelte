;

let {value,...rest}: typeof __rsvelte_public_props0=$props();
function change() { rest.other=1; rest.count++; let x; x=rest.other; return rest.other; }

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
    (rest.other);
    (rest.value);
    (rest['other']);
  }
};
const OptionsCustomRestAccess__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type OptionsCustomRestAccess__SvelteComponent_ = ReturnType<typeof OptionsCustomRestAccess__SvelteComponent_>;
export default OptionsCustomRestAccess__SvelteComponent_;
