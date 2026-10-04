;
const value=123n;
;

() => {
  {
    svelteHTML.createElement("p", {
      class: value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
