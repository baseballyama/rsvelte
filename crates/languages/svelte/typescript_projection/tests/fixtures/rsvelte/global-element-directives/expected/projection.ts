;
import {fade} from "svelte/transition"; let c = $state("red"); let x=$state(1);
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
const GlobalElementDirectives__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalElementDirectives__SvelteComponent_ = ReturnType<typeof GlobalElementDirectives__SvelteComponent_>;
export default GlobalElementDirectives__SvelteComponent_;
