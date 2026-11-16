;
function $$render() {
  const items=Array.from({length:2},(_,i)=>({text:`a${i}`}));
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": items[0].text,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const TemplateObject__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof TemplateObject__SvelteComponent_>} */ (TemplateObject__SvelteComponent_);
