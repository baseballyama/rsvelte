;
import { tip, lock } from './a.js';;

;

function $$render() {
  
	
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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const GlobalActions__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalActions__SvelteComponent_>} GlobalActions__SvelteComponent_ */
export default GlobalActions__SvelteComponent_;
