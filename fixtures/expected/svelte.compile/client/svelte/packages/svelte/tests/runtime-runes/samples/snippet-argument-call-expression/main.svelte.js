import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const foo = ($$anchor, a = $.noop) => {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${a().foo ?? ''} ${a().bar ?? ''}`));
	$.append($$anchor, text);
};

export default function Main($$anchor) {
	let el = $.proxy({ foo: 'foo', bar: 'bar' });

	function fn(el) {
		console.log('invoked');

		return el;
	}

	{
		let $0 = $.derived(() => fn(el));

		foo($$anchor, () => $.get($0));
	}
}