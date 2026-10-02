import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function write(value) {
		return foo(value);
	}

	// a leading comment on the declaration
	// that spans more than one line
	let foo = $.derived(() => 'x');

	let bar = write('y');

	const ctx = {
		get later() {
			return later();
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	let later = $.derived(() => 'LATER');

	$$renderer.push(`<p>${$.escape(foo())}:${$.escape(bar)}</p> <p>${$.escape(ctx.later)}</p> <input${$.attr('value', later())}/>`);
}