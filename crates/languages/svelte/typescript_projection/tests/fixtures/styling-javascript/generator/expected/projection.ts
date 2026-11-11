;
function* values(){yield "a";yield* ["b"];}const value=values().next().value;
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const Generator__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Generator__SvelteComponent_ = ReturnType<typeof Generator__SvelteComponent_>;
export default Generator__SvelteComponent_;
