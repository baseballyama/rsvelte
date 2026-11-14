;

	let flavours = $state(['mint']);
	const all = ['mint', 'lemon', 'cherry'];

;

async () => {
  {
    svelteHTML.createElement("select", {
      "multiple": true,
      "bind:value": flavours,
    });
    () => {
      // @ts-ignore
      flavours = __rsvelte_untyped_prop();
    };
    {
      for (let [, flavour] of __rsvelte_each(all)) {
        {
          svelteHTML.createElement("option", {
            "value": flavour,
          });
          (flavour);
        }
      }
    }
  }
  {
    svelteHTML.createElement("p", {});
    (flavours.join(', '));
  }
};
const SelectMultiple__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SelectMultiple__SvelteComponent_>} */ (SelectMultiple__SvelteComponent_);
