;
function $$render() {
  let win = $state(); let n = $state(0);
;

  async () => {
    {
      win = svelteHTML.createElement("svelte:window", {
        "onclick": () => n++,
      });
    }
    {
      svelteHTML.createElement("p", {});
      n;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const GlobalsBindThisMixed__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalsBindThisMixed__SvelteComponent_>} GlobalsBindThisMixed__SvelteComponent_ */
export default GlobalsBindThisMixed__SvelteComponent_;
