;
const value=<string>("a" as unknown as string);const fn=((x:string)=>x) as (x:string)=>string;
;

() => {
  {
    svelteHTML.createElement("p", {
      class: fn(value),
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
