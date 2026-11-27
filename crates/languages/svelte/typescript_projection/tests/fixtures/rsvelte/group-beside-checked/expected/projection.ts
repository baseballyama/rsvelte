;
function $$render() {
  let g = $state(); let t = $state('a'); let /** @typedef {{ p: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { p } = $props();
;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": "radio",
        "value": t,
        "checked": t === g,
      });
      g = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "value": t,
        "checked": t === g,
        ...(p),
      });
      g = __rsvelte_untyped_prop();
    }
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "checked": true,
      });
      g = __rsvelte_untyped_prop();
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const GroupBesideChecked__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GroupBesideChecked__SvelteComponent_>} GroupBesideChecked__SvelteComponent_ */
export default GroupBesideChecked__SvelteComponent_;
