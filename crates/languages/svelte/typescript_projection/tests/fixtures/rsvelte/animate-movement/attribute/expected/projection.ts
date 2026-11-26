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
            "class": "a",
          });
          __sveltets_2_ensureAnimation(f(svelteHTML.mapElementTag("div"), __sveltets_2_AnimationMove));
        }
      }
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const Attribute__SvelteComponent_ = $$render();
type Attribute__SvelteComponent_ = InstanceType<typeof Attribute__SvelteComponent_>;
export default Attribute__SvelteComponent_;
