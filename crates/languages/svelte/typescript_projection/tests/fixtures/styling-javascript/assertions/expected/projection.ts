;
const value=<string>("a" as unknown as string);const fn=((x:string)=>x) as (x:string)=>string;
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": fn(value),
    });
  }
};
const Assertions__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Assertions__SvelteComponent_ = ReturnType<typeof Assertions__SvelteComponent_>;
export default Assertions__SvelteComponent_;
