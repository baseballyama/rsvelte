;
const $$slots = (/** @type {typeof __rsvelte_slot_flags<"header" | "default">} */ (__rsvelte_slot_flags))();

	/** @type {typeof __rsvelte_public_props0} */ let { title, ...rest } = $props();
	const named = $$slots.header ? 'with' : 'without';

;

const __rsvelte_public_props0 = __rsvelte_props({
  title: __rsvelte_untyped_prop(),
}, {}, true);
async () => {
  if ($$slots.header) {
    {
      svelteHTML.createElement("header", {});
      {
        __rsvelte_slots()("header", {});
      }
    }
  }
  {
    svelteHTML.createElement("h1", {
      ...(rest),
    });
    (title);
    (named);
  }
  {
    __rsvelte_slots()("default", {});
  }
};
const SlotsObject__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_props_with_children<typeof __rsvelte_public_props0>, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SlotsObject__SvelteComponent_>} */ (SlotsObject__SvelteComponent_);
