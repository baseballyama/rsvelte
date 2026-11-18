;
function $$render() {
  let value="a";function run(){try{throw "b";}catch(error){value=error;}finally{console.log(value);}}
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const Try__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Try__SvelteComponent_>} */ (Try__SvelteComponent_);
