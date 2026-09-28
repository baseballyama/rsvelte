import * as $ from 'svelte/internal/server';

class SomeLogic {
	someValue = 0;
	#isAboveThree = $.derived(() => this.someValue > 3);

	get isAboveThree() {
		return this.#isAboveThree();
	}

	set isAboveThree($$value) {
		return this.#isAboveThree($$value);
	}

	trigger() {
		this.someValue++;
	}
}

const someLogic = new SomeLogic();

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function increment() {
			someLogic.trigger();
		}

		let localDerived = $.derived(() => someLogic.someValue > 3);

		$$renderer.push(`<button>clicks: ${$.escape(someLogic.someValue)}</button>`);
	});
}