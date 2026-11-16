;
export const value="a";export function get(){return value;}
;

function $$render() {
  const local=get();
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": local,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const Module__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Module__SvelteComponent_>} */ (Module__SvelteComponent_);
