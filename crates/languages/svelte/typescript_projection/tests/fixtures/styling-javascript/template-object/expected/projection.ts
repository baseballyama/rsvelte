;
const items=Array.from({length:2},(_,i)=>({text:`a${i}`}));
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": items[0].text,
    });
  }
};
const TemplateObject__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type TemplateObject__SvelteComponent_ = ReturnType<typeof TemplateObject__SvelteComponent_>;
export default TemplateObject__SvelteComponent_;
