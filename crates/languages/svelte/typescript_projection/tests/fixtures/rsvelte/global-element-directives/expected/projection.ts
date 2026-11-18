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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const GlobalElementDirectives__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof GlobalElementDirectives__SvelteComponent_>} */ (GlobalElementDirectives__SvelteComponent_);
