;
let count = $state(0);
;

() => {
  {
    svelteHTML.createElement("div", {
      dir: "auto",
    });
    (count);
  }
  {
    svelteHTML.createElement("p", {
      dir: "rtl",
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
