import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let stuff = $.proxy({ foo: true, bar: [1, 2, { baz: 'baz' }] });

	let $$array = $.derived(() => $.to_array(stuff.bar, 3)),
		foo = $.derived(() => stuff.foo),
		a = $.derived(() => $.get($$array)[0]),
		b = $.derived(() => $.get($$array)[1]),
		baz = $.derived(() => $.get($$array)[2].baz);

	let stuff2 = $.proxy([1, 2, 3]);

	let $$array_1 = $.derived(() => $.to_array(stuff2, 3)),
		d = $.derived(() => $.get($$array_1)[0]),
		e = $.derived(() => $.get($$array_1)[1]),
		f = $.derived(() => $.get($$array_1)[2]);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$.get(foo) ?? ''} ${$.get(a) ?? ''} ${$.get(b) ?? ''} ${$.get(baz) ?? ''} ${$.get(d) ?? ''} ${$.get(e) ?? ''} ${$.get(f) ?? ''}`));
	$.append($$anchor, text);
}