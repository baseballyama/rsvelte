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
const DebugTags__SvelteComponent_ = __rsvelte_export_component();
export default DebugTags__SvelteComponent_;
