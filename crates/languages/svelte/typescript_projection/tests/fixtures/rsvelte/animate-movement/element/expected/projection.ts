;
function $$render() {
  
	function f(node: Element, p: { d: number }) { return {}; }

;

  async () => {
    {
      for (let x of __rsvelte_each([1])) {
        (x);
        {
          svelteHTML.createElement("div", {});
          __sveltets_2_ensureAnimation(f(svelteHTML.mapElementTag("svelte:element"), __sveltets_2_AnimationMove));
        }
      }
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const Element__SvelteComponent_ = $$render();
type Element__SvelteComponent_ = InstanceType<typeof Element__SvelteComponent_>;
export default Element__SvelteComponent_;
