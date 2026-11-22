;
function $$render() {
  
	function f(node: Element, p: { d: number }) { return {}; }

;

  async () => {
    {
      __rsvelte_slots()("default", {});
      __sveltets_2_ensureType(String, Number, 1);
      __sveltets_2_ensureTransition(f(svelteHTML.mapElementTag("slot")));
      __sveltets_2_ensureAnimation(f(svelteHTML.mapElementTag("slot"), __sveltets_2_AnimationMove));
    }
  };
  return __rsvelte_export_isomorphic_slots<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({
    "default": {},
  });
}
const Mixed__SvelteComponent_ = $$render();
type Mixed__SvelteComponent_ = InstanceType<typeof Mixed__SvelteComponent_>;
export default Mixed__SvelteComponent_;
