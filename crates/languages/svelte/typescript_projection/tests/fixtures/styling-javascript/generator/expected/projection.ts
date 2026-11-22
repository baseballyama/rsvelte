;
function $$render() {
  function* values(){yield "a";yield* ["b"];}const value=values().next().value;
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const Generator__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Generator__SvelteComponent_>} Generator__SvelteComponent_ */
export default Generator__SvelteComponent_;
