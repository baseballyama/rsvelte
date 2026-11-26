;
function $$render() {
  
	function f(node: Element, p: { d: number }) { return {}; }

;

  async () => {
    {
      for (let x of __rsvelte_each([1])) {
        (x);
        {
          svelteHTML.createElement("div", {
            "hidden": true,
          });
          __sveltets_2_ensureAnimation(f(svelteHTML.mapElementTag("div"), __sveltets_2_AnimationMove));
        }
      }
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const BooleanAttribute__SvelteComponent_ = $$render();
type BooleanAttribute__SvelteComponent_ = InstanceType<typeof BooleanAttribute__SvelteComponent_>;
export default BooleanAttribute__SvelteComponent_;
