;
function $$render() {
  const value="a";async function load(){return import("./x.js");}
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const DynamicImport__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof DynamicImport__SvelteComponent_>} DynamicImport__SvelteComponent_ */
export default DynamicImport__SvelteComponent_;
