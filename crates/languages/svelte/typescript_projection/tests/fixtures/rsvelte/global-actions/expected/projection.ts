;

	import { tip, lock } from './a.js';
	let locked = $state(false);

;

async () => {
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(lock(svelteHTML.mapElementTag("body"), (locked)));
    const __rsvelte_action1 = __sveltets_2_ensureAction(tip(svelteHTML.mapElementTag("body")));
    svelteHTML.createElement("svelte:body", __sveltets_2_union(__rsvelte_action0, __rsvelte_action1), {
      "onclick": () => (locked = !locked),
    });
  }
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(tip(svelteHTML.mapElementTag("svelte:document"), ('x')));
    svelteHTML.createElement("svelte:document", __sveltets_2_union(__rsvelte_action0), {
      [Symbol("@attach")]: (n) => console.log(n),
    });
  }
  {
    const __rsvelte_action0 = __sveltets_2_ensureAction(tip(svelteHTML.mapElementTag("svelte:window")));
    svelteHTML.createElement("svelte:window", __sveltets_2_union(__rsvelte_action0), {});
  }
};
const GlobalActions__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalActions__SvelteComponent_ = ReturnType<typeof GlobalActions__SvelteComponent_>;
export default GlobalActions__SvelteComponent_;
