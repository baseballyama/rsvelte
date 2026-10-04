;
const value="a";function run(x){switch(x){case 1:return "a";case 2:throw new Error("b");default:return "b";}}
;

{
  svelteHTML.createElement("p", {
    class: run(1),
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
