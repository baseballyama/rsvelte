;
function $$render() {
  
	class Counter {
		count = $state(0);
		#priv = $state.raw({ a: 1 });
		doubled = $derived(this.count * 2);
		tripled = $derived.by(() => this.count * 3);
		static s = 1;
		plain = 2;
		constructor(x) {
			this.later = $state(x);
			this.#other = $state([]);
		}
		#other;
		inc() { this.count++; this.#priv = { a: 2 }; this.#other.push(1); }
		get p() { return this.#priv.a; }
	}
	const c = new Counter(1);
	let obj = { k: class { v = $state(1); } };

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => c.inc(),
      });
      c.count;
      c.doubled;
      c.p;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ClassStateConstructor__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ClassStateConstructor__SvelteComponent_>} ClassStateConstructor__SvelteComponent_ */
export default ClassStateConstructor__SvelteComponent_;
