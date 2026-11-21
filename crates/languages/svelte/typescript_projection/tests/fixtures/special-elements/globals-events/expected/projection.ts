;
function $$render() {
  function handler(event) { console.log(event.type); }
;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "onclick": handler,
        "onresize": handler,
      });
    }
    {
      svelteHTML.createElement("svelte:document", {
        "onkeydown": handler,
      });
    }
    {
      svelteHTML.createElement("svelte:body", {
        "ontouchstart": handler,
      });
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const GlobalsEvents__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof GlobalsEvents__SvelteComponent_>} GlobalsEvents__SvelteComponent_ */
export default GlobalsEvents__SvelteComponent_;
