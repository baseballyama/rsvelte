;

	function first(node: HTMLElement) {
		node.focus();
	}
	function second(node: HTMLElement, value: number) {
		node.tabIndex = value;
	}

;

async () => {
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(first(svelteHTML.mapElementTag("input")));
    const __rsvelte_action1 = __sveltets_2_ensureAction(second(svelteHTML.mapElementTag("input"), (1)));
    svelteHTML.createElement("input", __sveltets_2_union(__rsvelte_action0, __rsvelte_action1), {});
  }
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(second(svelteHTML.mapElementTag("input"), ('x')));
    svelteHTML.createElement("input", __sveltets_2_union(__rsvelte_action0), {});
  }
};
const ActionsTwo__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ActionsTwo__SvelteComponent_ = ReturnType<typeof ActionsTwo__SvelteComponent_>;
export default ActionsTwo__SvelteComponent_;
