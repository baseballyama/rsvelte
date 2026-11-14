;
function* values(){yield "a";yield* ["b"];}const value=values().next().value;
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const Generator__SvelteComponent_ = __rsvelte_export_component();
export default Generator__SvelteComponent_;
