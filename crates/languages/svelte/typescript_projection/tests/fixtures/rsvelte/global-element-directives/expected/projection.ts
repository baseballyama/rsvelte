;
import {fade} from "svelte/transition";;

;

function $$render() {
   let c = $state("red"); let x=$state(1);
;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {});
      __sveltets_2_ensureType(String, Number, c);
      __sveltets_2_ensureTransition(fade(svelteHTML.mapElementTag("svelte:window")));
      (x);
    }
    {
      svelteHTML.createElement("svelte:body", {});
      __sveltets_2_ensureType(String, Number, c);
      (b);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const GlobalElementDirectives__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalElementDirectives__SvelteComponent_>} GlobalElementDirectives__SvelteComponent_ */
export default GlobalElementDirectives__SvelteComponent_;
