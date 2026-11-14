;
const items=Array.from({length:2},(_,i)=>({text:`a${i}`}));
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": items[0].text,
    });
  }
};
const TemplateObject__SvelteComponent_ = __rsvelte_export_component();
export default TemplateObject__SvelteComponent_;
