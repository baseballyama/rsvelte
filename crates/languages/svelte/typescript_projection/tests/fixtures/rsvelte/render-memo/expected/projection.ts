;
import { format } from "./format.js";;

;

function $$render() {
  
  const row = (label, onclick) => {
    async () => {
      {
        svelteHTML.createElement("button", {
          onclick,
        });
        label;
      }
    };
    return __rsvelte_snippet_return;
  };
 let /** @typedef {{ items: any, header: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { items, header } = $props(); let count = $state(0);
;

  async () => {
    {
      svelteHTML.createElement("div", {});
      __rsvelte_ensure_snippet(row(format(items), () => count++));
    }
    __rsvelte_ensure_snippet(header?.(format(count), count));
    __rsvelte_ensure_snippet(row(`${count}`, format));
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const RenderMemo__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RenderMemo__SvelteComponent_>} RenderMemo__SvelteComponent_ */
export default RenderMemo__SvelteComponent_;
