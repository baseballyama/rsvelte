;
const f=(x=`a${1}`)=>x;
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": f(),
    });
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
