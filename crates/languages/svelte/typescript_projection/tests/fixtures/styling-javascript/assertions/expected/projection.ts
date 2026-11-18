;
function $$render() {
  const value=<string>("a" as unknown as string);const fn=((x:string)=>x) as (x:string)=>string;
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": fn(value),
      });
    }
  };
  return __rsvelte_export_component<__rsvelte_no_props, {}, string>();
}
const Assertions__SvelteComponent_ = $$render();
type Assertions__SvelteComponent_ = ReturnType<typeof Assertions__SvelteComponent_>;
export default Assertions__SvelteComponent_;
