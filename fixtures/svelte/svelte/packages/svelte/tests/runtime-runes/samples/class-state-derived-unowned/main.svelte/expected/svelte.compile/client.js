import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

class SomeLogic {
	#someValue = $.state(0);

	get someValue() {
		return $.get(this.#someValue);
	}

	set someValue(value) {
		$.set(this.#someValue, value, true);
	}

	#isAboveThree = $.derived(() => this.someValue > 3);

	get isAboveThree() {
		return $.get(this.#isAboveThree);
	}

	set isAboveThree(value) {
		$.set(this.#isAboveThree, value);
	}

	trigger() {
		this.someValue++;
	}
}

const someLogic = new SomeLogic();
var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function increment() {
		someLogic.trigger();
	}

	let localDerived = $.derived(() => someLogic.someValue > 3);

	$.user_effect(() => {
		console.log(someLogic.someValue);
	});

	$.user_effect(() => {
		console.log('class trigger ' + someLogic.isAboveThree);
	});

	$.user_effect(() => {
		console.log('local trigger ' + $.get(localDerived));
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${someLogic.someValue ?? ''}`));
	$.event('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}