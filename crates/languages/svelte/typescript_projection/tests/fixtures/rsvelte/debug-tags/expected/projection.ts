;
function $$render() {
  let x = $state(1); let y = 2; let o = $state({a: 1});
;

  async () => {
    {
      (x);
      (y);
    }
    {
    }
    if (x) {
      {
        (o);
      }
    }
    {
      svelteHTML.createElement("button", {
        "onclick": () => x++,
      });
      x;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DebugTags__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DebugTags__SvelteComponent_>} DebugTags__SvelteComponent_ */
export default DebugTags__SvelteComponent_;
