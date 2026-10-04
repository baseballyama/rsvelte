;
const value=(/[)]/.test("a")?"a":"b");
;

() => {
  {
    svelteHTML.createElement("p", {
      class: value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
