;
function $$render() {
  
	let /** @typedef {{ href: any, label: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { href, label } = $props();

;

  async () => {
    {
      svelteHTML.createElement("a", {
        href,
        "class": "link",
        "title": `go to ${label}`,
      });
      label;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const Attributes__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Attributes__SvelteComponent_>} Attributes__SvelteComponent_ */
export default Attributes__SvelteComponent_;
