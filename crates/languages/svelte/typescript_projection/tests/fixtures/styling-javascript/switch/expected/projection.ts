;
const value="a";function run(x){switch(x){case 1:return "a";case 2:throw new Error("b");default:return "b";}}
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": run(1),
    });
  }
};
const Switch__SvelteComponent_ = __rsvelte_export_component();
export default Switch__SvelteComponent_;
