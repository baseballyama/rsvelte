;

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
    (double);
    (foo);
  }
};
const VarStateReads__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof VarStateReads__SvelteComponent_>} */ (VarStateReads__SvelteComponent_);
