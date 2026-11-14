;
/** @type {typeof __rsvelte_public_props0} */ let { items, children } = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  items: __rsvelte_untyped_prop(),
  children: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("ul", {
      "class": "list",
    });
    const row = (item, index = 0) => {
      async () => {
        {
          svelteHTML.createElement("li", {});
          (index);
          (item.label);
        }
      };
      return __rsvelte_snippet_return;
    };
    {
      for (let [i, item] of __rsvelte_each(items)) {
        __rsvelte_ensure_snippet(row(item, i));
      }
    }
  }
  if (items.length) {
    const empty = ({ title, count = 1 }) => {
      async () => {
        {
          svelteHTML.createElement("p", {});
          (title);
          (count);
        }
      };
      return __rsvelte_snippet_return;
    };
    __rsvelte_ensure_snippet(empty({ title: "none" }));
  }
  __rsvelte_ensure_snippet(children?.());
};
const SnippetNested__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SnippetNested__SvelteComponent_>} */ (SnippetNested__SvelteComponent_);
