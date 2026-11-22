;
function $$render() {
  
	console.log(foo, double);
	var foo = $state(10);
	var double = $derived(foo * 2);
	console.log(foo, double);

	function wrap(initial) {
		var _value = $state(initial);

		return {
			get() {
				return _value;
			},
			set(state) {
				_value = state;
			}
		};
	}

	var wrapped = wrap(0);
	console.log(wrapped.get());
	wrapped.set(1);
	console.log(wrapped.get());

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      double;
      foo;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const VarStateReads__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof VarStateReads__SvelteComponent_>} VarStateReads__SvelteComponent_ */
export default VarStateReads__SvelteComponent_;
