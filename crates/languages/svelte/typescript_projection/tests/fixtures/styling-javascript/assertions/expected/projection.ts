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
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({});
}
const Assertions__SvelteComponent_ = $$render();
type Assertions__SvelteComponent_ = InstanceType<typeof Assertions__SvelteComponent_>;
export default Assertions__SvelteComponent_;
