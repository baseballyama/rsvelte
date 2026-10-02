import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let test = $.proxy({ a: new Date() });
	let test2 = $.snapshot(test);
	let test3 = { a: new Date() };
	let test4 = structuredClone(test3);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${test.a instanceof Date}
${test2.a instanceof Date}
${test3.a instanceof Date}
${test4.a instanceof Date}`));

	$.append($$anchor, text);
	$.pop();
}