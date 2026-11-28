;
function $$render() {
  let /** @typedef {{ items: any, children: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { items, children } = $props();
;

  async () => {
    {
      svelteHTML.createElement("ul", {
        "class": "list",
      });
      const row = (item, index = 0) => {
        async () => {
          {
            svelteHTML.createElement("li", {});
            index;
            item.label;
          }
        };
        return __rsvelte_snippet_return;
      };
      {
        for (let item of __rsvelte_each(items)) {
          let i = 1;
          __rsvelte_ensure_snippet(row(item, i));
        }
      }
    }
    if (items.length) {
      const empty = ({ title, count = 1 }) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            title;
            count;
          }
        };
        return __rsvelte_snippet_return;
      };
      __rsvelte_ensure_snippet(empty({ title: "none" }));
    }
    __rsvelte_ensure_snippet(children?.());
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetNested__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetNested__SvelteComponent_>} SnippetNested__SvelteComponent_ */
export default SnippetNested__SvelteComponent_;
