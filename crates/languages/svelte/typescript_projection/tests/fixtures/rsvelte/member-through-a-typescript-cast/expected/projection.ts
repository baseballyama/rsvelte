;
function $$render() {
  
	let o = { p: 1 };

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      (globalThis as any).p;
    }
    {
      svelteHTML.createElement("p", {});
      (o satisfies object).p;
    }
    {
      svelteHTML.createElement("p", {});
      (fn!)();
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({});
}
const MemberThroughATypescriptCast__SvelteComponent_ = $$render();
type MemberThroughATypescriptCast__SvelteComponent_ = InstanceType<typeof MemberThroughATypescriptCast__SvelteComponent_>;
export default MemberThroughATypescriptCast__SvelteComponent_;
