;
let value="a";function run(){try{throw "b";}catch(error){value=error;}finally{console.log(value);}}
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const Try__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Try__SvelteComponent_>} */ (Try__SvelteComponent_);
