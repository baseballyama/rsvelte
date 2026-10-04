;
const values=["a","b"];
;

{
  for (let [i, value] of __rsvelte_each(values as string[])) {
    (i);
    {
      svelteHTML.createElement("p", {
        class: value,
      });
    }
  }
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
