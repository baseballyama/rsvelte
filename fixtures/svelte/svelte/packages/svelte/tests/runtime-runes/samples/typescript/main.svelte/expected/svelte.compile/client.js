import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

function this_fn() {
	console.log(this);
}

function foo() {
	return "";
}

class Foo {
	name;
	x = 'x';

	constructor(name) {
		this.name = name;
	}
}

class MyClass {}

class MyAbstractClass {
	y() {}
}

class Subclass extends Foo {
	constructor(value) {
		super(value);
	}
}

export function overload(c) {}

const TypedFoo = Foo;
const typeAssertion = true;
const x = foo();
var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	const person = { message: 'goodbye' };
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));

	$.event('click', button, (e) => {
		const next = $.get(count) + 1;

		$.set(count, next);
	});

	$.append($$anchor, button);
	$.pop();
}