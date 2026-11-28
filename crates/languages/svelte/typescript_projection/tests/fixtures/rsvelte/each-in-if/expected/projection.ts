;
function $$render() {
  
	let /** @typedef {{ show: any, list: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { show, list } = $props();

;

  async () => {
    if (show) {
      {
        for (let entry of __rsvelte_each(list)) {
          {
            svelteHTML.createElement("span", {});
            entry;
          }
        }
      }
    } else {
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const EachInIf__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachInIf__SvelteComponent_>} EachInIf__SvelteComponent_ */
export default EachInIf__SvelteComponent_;
