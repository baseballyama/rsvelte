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

() => {
  {
    svelteHTML.createElement("p", {});
    (double);
    (foo);
  }
};
const VarStateReads__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type VarStateReads__SvelteComponent_ = ReturnType<typeof VarStateReads__SvelteComponent_>;
export default VarStateReads__SvelteComponent_;
