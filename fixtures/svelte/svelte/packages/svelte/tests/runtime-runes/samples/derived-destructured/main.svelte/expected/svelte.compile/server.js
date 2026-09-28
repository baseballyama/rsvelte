import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let stuff = { foo: true, bar: [1, 2, { baz: 'baz' }] };

	let $$derived_array = $.derived(() => $.to_array(stuff.bar, 3)),
		foo = $.derived(() => stuff.foo),
		a = $.derived(() => $$derived_array()[0]),
		b = $.derived(() => $$derived_array()[1]),
		baz = $.derived(() => $$derived_array()[2].baz);

	let stuff2 = [1, 2, 3];

	let $$derived_array_1 = $.derived(() => $.to_array(stuff2, 3)),
		d = $.derived(() => $$derived_array_1()[0]),
		e = $.derived(() => $$derived_array_1()[1]),
		f = $.derived(() => $$derived_array_1()[2]);

	$$renderer.push(`<!---->${$.escape(foo())} ${$.escape(a())} ${$.escape(b())} ${$.escape(baz())} ${$.escape(d())} ${$.escape(e())} ${$.escape(f())}`);
}