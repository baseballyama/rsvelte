;

	let d = $state(1);
	function make() {
		return () => d++;
	}

;

() => {
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
const EventHandlerDerived__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EventHandlerDerived__SvelteComponent_ = ReturnType<typeof EventHandlerDerived__SvelteComponent_>;
export default EventHandlerDerived__SvelteComponent_;
