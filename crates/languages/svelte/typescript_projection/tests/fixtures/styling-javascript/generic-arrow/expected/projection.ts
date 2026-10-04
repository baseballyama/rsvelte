;
const identity=<T,>(value:T):T=>value;const value=identity("a");
;

() => {
  {
    svelteHTML.createElement("p", {
      class: value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
