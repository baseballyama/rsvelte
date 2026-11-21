;
function $$render() {
  
	let d = $state(1);
	function make() {
		return () => d++;
	}

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "on:click": make(),
      });
      d;
    }
    {
      const __rsvelte_action0 = __sveltets_2_ensureAction(action(svelteHTML.mapElementTag("input")));
      svelteHTML.createElement("input", __sveltets_2_union(__rsvelte_action0), {
        "on:input": make(),
        "value": d,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const EventHandlerDerived__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EventHandlerDerived__SvelteComponent_>} EventHandlerDerived__SvelteComponent_ */
export default EventHandlerDerived__SvelteComponent_;
