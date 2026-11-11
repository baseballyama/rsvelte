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
const Regex__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Regex__SvelteComponent_ = ReturnType<typeof Regex__SvelteComponent_>;
export default Regex__SvelteComponent_;
