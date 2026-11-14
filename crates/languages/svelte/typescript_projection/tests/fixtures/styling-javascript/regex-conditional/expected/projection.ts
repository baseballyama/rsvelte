;
const value=(/[)]/.test("a")?"a":"b");
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const RegexConditional__SvelteComponent_ = __rsvelte_export_component();
export default RegexConditional__SvelteComponent_;
