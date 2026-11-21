;
function $$render() {
  const $$slots = (/** @type {typeof __rsvelte_slot_flags<"header" | "default">} */ (__rsvelte_slot_flags))();

	let /** @type {typeof __rsvelte_public_props0} */ { title, ...rest } = $props();
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
      title;
      named;
    }
    {
      __rsvelte_slots()("default", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic_slots<typeof __rsvelte_public_props0, { [evt: string]: CustomEvent<any> }, {}, "">} */ (__rsvelte_export_isomorphic_slots))()({
    "header": {},
    "default": {},
  });
}
export const SlotsObject__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SlotsObject__SvelteComponent_>} SlotsObject__SvelteComponent_ */
export default SlotsObject__SvelteComponent_;
