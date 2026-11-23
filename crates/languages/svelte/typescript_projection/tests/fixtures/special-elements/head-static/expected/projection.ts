;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:head", {});
      {
        svelteHTML.createElement("title", {});
      }
      {
        svelteHTML.createElement("meta", {
          "name": "description",
          "content": "test",
        });
      }
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const HeadStatic__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof HeadStatic__SvelteComponent_>} HeadStatic__SvelteComponent_ */
export default HeadStatic__SvelteComponent_;
