;

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
    (d);
  }
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(action(svelteHTML.mapElementTag("input")));
    svelteHTML.createElement("input", __sveltets_2_union(__rsvelte_action0), {
      "on:input": make(),
      "value": d,
    });
  }
};
const EventHandlerDerived__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof EventHandlerDerived__SvelteComponent_>} */ (EventHandlerDerived__SvelteComponent_);
