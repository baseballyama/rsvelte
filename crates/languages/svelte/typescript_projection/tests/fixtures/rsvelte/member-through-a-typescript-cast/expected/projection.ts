;

	let o = { p: 1 };

;

async () => {
  {
    svelteHTML.createElement("p", {});
    ((globalThis as any).p);
  }
  {
    svelteHTML.createElement("p", {});
    ((o satisfies object).p);
  }
  {
    svelteHTML.createElement("p", {});
    ((fn!)());
  }
};
const MemberThroughATypescriptCast__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type MemberThroughATypescriptCast__SvelteComponent_ = ReturnType<typeof MemberThroughATypescriptCast__SvelteComponent_>;
export default MemberThroughATypescriptCast__SvelteComponent_;
