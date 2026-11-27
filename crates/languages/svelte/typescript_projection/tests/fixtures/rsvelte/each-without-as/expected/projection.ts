;
function $$render() {
  
	let /** @typedef {{ items?: any[], count?: number }} $$ComponentProps *//** @type {$$ComponentProps} */ { items = [], count = 2 } = $props();
	let item = $state('outer');

;

  async () => {
    {
      for (let __rsvelte_item0 of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("p", {});
          item;
        }
      }
    }
    {
      for (let __rsvelte_item0 of __rsvelte_each(items)) {
        let i = 1;
        {
          svelteHTML.createElement("p", {});
          i;
        }
      }
    }
    {
      for (let __rsvelte_item0 of __rsvelte_each({ length: count })) {
        let i = 1;
        {
          svelteHTML.createElement("span", {});
          i;
        }
      }
      {
      }
    }
    {
      for (let __rsvelte_item0 of __rsvelte_each({ length: 3 })) {
        {
          svelteHTML.createElement("b", {});
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const EachWithoutAs__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof EachWithoutAs__SvelteComponent_>} EachWithoutAs__SvelteComponent_ */
export default EachWithoutAs__SvelteComponent_;
