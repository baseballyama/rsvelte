;
function $$render() {
  
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

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => counter.inc(),
      });
      counter.sum;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ClassStateInConstructor__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ClassStateInConstructor__SvelteComponent_>} ClassStateInConstructor__SvelteComponent_ */
export default ClassStateInConstructor__SvelteComponent_;
