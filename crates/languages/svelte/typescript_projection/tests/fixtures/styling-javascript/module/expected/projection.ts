;
export const value="a";export function get(){return value;}
;

function $$render() {
  const local=get();
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": local,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const Module__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Module__SvelteComponent_>} Module__SvelteComponent_ */
export default Module__SvelteComponent_;
