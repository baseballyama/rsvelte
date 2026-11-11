export const Boxed = class Inner {
	value = $state(0);
	doubled = $derived(this.value * 2);
};

const factory = () => {
	class Local {
		n = $state(1);

		bump() {
			this.n += 1;
		}
	}
	return new Local();
};

export default class Outer {
	items = $state([]);
	#top = $derived(this.items[0] ?? null);

	get top() {
		return this.#top;
	}

	makeChild() {
		class Child extends Outer {
			extra = $state('c');
		}
		return new Child();
	}
}

export const instance = factory();
