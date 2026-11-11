;
import { format } from "./format.js";
const row = (label, onclick): ReturnType<import('svelte').Snippet> => {
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
 let { items, header }: typeof __rsvelte_public_props0 = $props(); let count = $state(0);
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
const RenderMemo__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type RenderMemo__SvelteComponent_ = ReturnType<typeof RenderMemo__SvelteComponent_>;
export default RenderMemo__SvelteComponent_;
