;
const $$slots = __rsvelte_slot_flags();

	let { title, ...rest } = $props();
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
const SlotsObject__SvelteComponent_ = __rsvelte_export_component();
export default SlotsObject__SvelteComponent_;
