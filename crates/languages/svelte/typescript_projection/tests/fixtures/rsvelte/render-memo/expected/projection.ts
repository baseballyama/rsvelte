;
import { format } from "./format.js";
const row = (label, onclick) => {
  async () => {
    {
      svelteHTML.createElement("button", {
        onclick,
      });
      (label);
    }
  };
  return __rsvelte_snippet_return;
};
 /** @type {typeof __rsvelte_public_props0} */ let { items, header } = $props(); let count = $state(0);
;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
  header: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("div", {});
    __rsvelte_ensure_snippet(row(format(items), () => count++));
  }
  __rsvelte_ensure_snippet(header?.(format(count), count));
  __rsvelte_ensure_snippet(row(`${count}`, format));
};
const RenderMemo__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof RenderMemo__SvelteComponent_>} */ (RenderMemo__SvelteComponent_);
