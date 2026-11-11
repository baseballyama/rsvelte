;
let x = $state(1); let y = 2; let o = $state({a: 1});
;

async () => {
  {
    (x);
    (y);
  }
  {
  }
  if (x) {
    {
      (o);
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => x++,
    });
    (x);
  }
};
const DebugTags__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DebugTags__SvelteComponent_ = ReturnType<typeof DebugTags__SvelteComponent_>;
export default DebugTags__SvelteComponent_;
