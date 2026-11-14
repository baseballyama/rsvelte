;
export const value="a";export function get(){return value;}
;

const local=get();
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": local,
    });
  }
};
const Module__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Module__SvelteComponent_>} */ (Module__SvelteComponent_);
