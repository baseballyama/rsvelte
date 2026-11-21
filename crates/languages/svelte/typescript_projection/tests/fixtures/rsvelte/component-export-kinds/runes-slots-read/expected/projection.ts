;
type $$ComponentProps = { a: number };

;

function $$render() {
  const $$slots = __rsvelte_slot_flags<never>();

	let { a }: $$ComponentProps = $props();

;

  async () => {
    if ($$slots.default) {
      {
        svelteHTML.createElement("p", {});
        a;
      }
    }
  };
  return __rsvelte_export_component<$$ComponentProps, {}, "">();
}
const RunesSlotsRead__SvelteComponent_ = $$render();
type RunesSlotsRead__SvelteComponent_ = ReturnType<typeof RunesSlotsRead__SvelteComponent_>;
export default RunesSlotsRead__SvelteComponent_;
