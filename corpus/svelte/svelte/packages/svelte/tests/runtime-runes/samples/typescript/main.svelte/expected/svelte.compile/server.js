import * as $ from 'svelte/internal/server';

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

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		const person = { message: 'goodbye' };

		$$renderer.push(`<button>clicks: ${$.escape(count)}</button>`);
	});
}