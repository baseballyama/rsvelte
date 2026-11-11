;

	class A {
		#count = 5;
		count = $state();
		r = $state.raw([1]);
		o = $state({ x: 1 });
		'a b' = $state(1);
		[k] = 1;
		constructor() {
			this.d = $derived(this.count + 1);
			this.#e = $state.raw(3);
			this.#f = $state(this.#e);
		}
		#e;
		#f;
		m(other) {
			this.r = [2];
			this.o = { y: 2 };
			this.#e += 1;
			this.#e++;
			--this.#e;
			this.#f = { z: 1 };
			this.#f ??= [];
			other.#e = 4;
			const t = this.#e;
			return t;
		}
	}
	const k = 'k';
	new A();

;

const ClassStatePrivate__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ClassStatePrivate__SvelteComponent_ = ReturnType<typeof ClassStatePrivate__SvelteComponent_>;
export default ClassStatePrivate__SvelteComponent_;
