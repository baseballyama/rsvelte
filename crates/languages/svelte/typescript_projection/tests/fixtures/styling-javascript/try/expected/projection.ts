;
let value="a";function run(){try{throw "b";}catch(error){value=error;}finally{console.log(value);}}
;

() => {
  {
    svelteHTML.createElement("p", {
      class: value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
