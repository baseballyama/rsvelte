;

	let [a = () => { let [x] = $state([1]); return x; }, [b]] = $state([]);

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (a());
    (b);
  }
};
const DefaultAfterEveryArrayIsNamed__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DefaultAfterEveryArrayIsNamed__SvelteComponent_ = ReturnType<typeof DefaultAfterEveryArrayIsNamed__SvelteComponent_>;
export default DefaultAfterEveryArrayIsNamed__SvelteComponent_;
