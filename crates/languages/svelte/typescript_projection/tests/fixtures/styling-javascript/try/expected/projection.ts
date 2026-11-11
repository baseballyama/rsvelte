;
let value="a";function run(){try{throw "b";}catch(error){value=error;}finally{console.log(value);}}
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const Try__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Try__SvelteComponent_ = ReturnType<typeof Try__SvelteComponent_>;
export default Try__SvelteComponent_;
