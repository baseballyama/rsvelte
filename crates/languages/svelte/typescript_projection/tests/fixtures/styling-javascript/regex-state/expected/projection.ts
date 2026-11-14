;
let pattern=$state(/a/g);
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": pattern.test("a") ? "a" : "b",
    });
  }
};
const RegexState__SvelteComponent_ = __rsvelte_export_component();
export default RegexState__SvelteComponent_;
