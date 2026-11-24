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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const TemplateObject__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof TemplateObject__SvelteComponent_>} TemplateObject__SvelteComponent_ */
export default TemplateObject__SvelteComponent_;
