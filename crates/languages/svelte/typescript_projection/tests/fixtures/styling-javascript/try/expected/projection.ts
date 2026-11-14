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
const Try__SvelteComponent_ = __rsvelte_export_component();
export default Try__SvelteComponent_;
