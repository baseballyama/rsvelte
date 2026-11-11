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
const Switch__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Switch__SvelteComponent_ = ReturnType<typeof Switch__SvelteComponent_>;
export default Switch__SvelteComponent_;
