;

	class Counter {
		#a = $state();
		#b = $state({ val: -1 });
		constructor() {
			this.#a ||= { val: 0 };
			this.#b.val += 1;
			this.sum = $derived(this.#a.val + this.#b.val);
			this.copy = $state(this.#b);
			this.later = () => this.#a;
			function nested(self) {
				return self.#b;
			}
			nested(this);
		}
		inc() {
			this.#a.val += 1;
		}
	}

	let counter = new Counter();

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => counter.inc(),
    });
    (counter.sum);
  }
};
const ClassStateInConstructor__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ClassStateInConstructor__SvelteComponent_ = ReturnType<typeof ClassStateInConstructor__SvelteComponent_>;
export default ClassStateInConstructor__SvelteComponent_;
