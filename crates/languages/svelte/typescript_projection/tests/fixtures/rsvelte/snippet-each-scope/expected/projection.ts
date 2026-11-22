;
function $$render() {
  
	let s = 'outer';

;

  async () => {
    {
      for (let [, x] of __rsvelte_each([1])) {
        const s = () => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              x;
            }
          };
          return __rsvelte_snippet_return;
        };
        __rsvelte_ensure_snippet(s());
      }
    }
    {
      for (let [, y] of __rsvelte_each([2])) {
        {
          svelteHTML.createElement("p", {});
          y;
        }
      }
    }
    s;
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const SnippetEachScope__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SnippetEachScope__SvelteComponent_>} SnippetEachScope__SvelteComponent_ */
export default SnippetEachScope__SvelteComponent_;
