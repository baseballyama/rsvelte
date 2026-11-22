;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	let { a }: $$ComponentProps = $props();

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "on:click": undefined,
      });
      a;
    }
  };
  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    "click": __sveltets_2_mapElementEvent("click"),
  }), {});
}
const ForwardedEvents__SvelteComponent_ = $$render();
type ForwardedEvents__SvelteComponent_ = InstanceType<typeof ForwardedEvents__SvelteComponent_>;
export default ForwardedEvents__SvelteComponent_;
