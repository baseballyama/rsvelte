;
const pattern=/[(){}\/]+/giu;
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": pattern.test("a") ? "a" : "b",
    });
  }
};
const Regex__SvelteComponent_ = __rsvelte_export_component();
export default Regex__SvelteComponent_;
