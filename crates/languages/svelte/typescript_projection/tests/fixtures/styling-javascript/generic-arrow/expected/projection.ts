;
const identity=<T,>(value:T):T=>value;const value=identity("a");
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const GenericArrow__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GenericArrow__SvelteComponent_ = ReturnType<typeof GenericArrow__SvelteComponent_>;
export default GenericArrow__SvelteComponent_;
