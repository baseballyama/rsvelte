import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

class Foo {
	#x = $.state(5);

	get x() {
		return $.get(this.#x);
	}

	set x(value) {
		$.set(this.#x, value, true);
	}

	#y = $.derived(() => this.x * 2);

	get y() {
		return $.get(this.#y);
	}

	set y(value) {
		$.set(this.#y, value);
	}
}

const foo = new Foo();
let x = $.state(2);
let y = $.derived(() => $.get(x) * 2);

const bar = {
	get x() {
		return $.get(x);
	},

	set x(val) {
		$.set(x, val, true);
	},

	get y() {
		return $.get(y);
	}
};

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);

	$.template_effect(() => {
		$.set_text(text, `x: ${foo.x ?? ''}, y: ${foo.y ?? ''}`);
		$.set_text(text_1, `x: ${bar.x ?? ''}, y: ${bar.y ?? ''}`);
	});

	$.delegated('click', button, () => foo.x++);
	$.delegated('click', button_1, () => bar.x++);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);