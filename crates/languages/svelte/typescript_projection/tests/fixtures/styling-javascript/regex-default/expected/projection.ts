;
const f=(pattern=/[(){}]/) => pattern.test("a");
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": f() ? "a" : "b",
    });
  }
};
const RegexDefault__SvelteComponent_ = __rsvelte_export_component();
export default RegexDefault__SvelteComponent_;
