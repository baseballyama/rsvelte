import * as $ from 'svelte/internal/server';

class Foo {
	x = 5;
	#y = $.derived(() => this.x * 2);

	get y() {
		return this.#y();
	}

	set y($$value) {
		return this.#y($$value);
	}
}

const foo = new Foo();
let x = 2;
let y = $.derived(() => x * 2);

const bar = {
	get x() {
		return x;
	},

	set x(val) {
		x = val;
	},

	get y() {
		return y();
	}
};

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<button>x: ${$.escape(foo.x)}, y: ${$.escape(foo.y)}</button> <button>x: ${$.escape(bar.x)}, y: ${$.escape(bar.y)}</button>`);
	});
}