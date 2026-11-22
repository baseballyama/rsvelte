;
function $$render() {
  let value="a";function run(){try{throw "b";}catch(error){value=error;}finally{console.log(value);}}
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
export const Try__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Try__SvelteComponent_>} Try__SvelteComponent_ */
export default Try__SvelteComponent_;
