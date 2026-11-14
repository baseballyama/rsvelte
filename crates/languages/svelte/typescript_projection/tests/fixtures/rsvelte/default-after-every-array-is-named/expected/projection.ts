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
const DefaultAfterEveryArrayIsNamed__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DefaultAfterEveryArrayIsNamed__SvelteComponent_>} */ (DefaultAfterEveryArrayIsNamed__SvelteComponent_);
