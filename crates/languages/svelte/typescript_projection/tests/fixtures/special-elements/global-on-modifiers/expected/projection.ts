;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "on:click": ()=>{},
      });
    }
    {
      svelteHTML.createElement("svelte:document", {
        "on:touchmove": ()=>{},
      });
    }
    {
      svelteHTML.createElement("svelte:body", {
        "on:keydown": ()=>{},
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const GlobalOnModifiers__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof GlobalOnModifiers__SvelteComponent_>} GlobalOnModifiers__SvelteComponent_ */
export default GlobalOnModifiers__SvelteComponent_;
