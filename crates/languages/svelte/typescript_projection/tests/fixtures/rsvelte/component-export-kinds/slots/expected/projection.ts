;
function $$render() {
  
	let x = $state(1);

;

  async () => {
    {
      __rsvelte_slots()("a", {
        "v": x,
      });
    }
  };
  return __rsvelte_export_isomorphic_slots<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, "">()({
    "a": {
      v: x,
    },
  });
}
const Slots__SvelteComponent_ = $$render();
type Slots__SvelteComponent_ = InstanceType<typeof Slots__SvelteComponent_>;
export default Slots__SvelteComponent_;
