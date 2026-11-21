;
function $$render() {
  let pattern=$state(/a/g);
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": pattern.test("a") ? "a" : "b",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const RegexState__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof RegexState__SvelteComponent_>} RegexState__SvelteComponent_ */
export default RegexState__SvelteComponent_;
