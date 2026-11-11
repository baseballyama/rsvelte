;
let count = $state(0);
;

() => {
  {
    svelteHTML.createElement("div", {
      "dir": "auto",
    });
    (count);
  }
  {
    svelteHTML.createElement("p", {
      "dir": "rtl",
    });
  }
};
const ElementDir__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ElementDir__SvelteComponent_ = ReturnType<typeof ElementDir__SvelteComponent_>;
export default ElementDir__SvelteComponent_;
