import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<p> </p> <p> </p> <button></button> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $a = () => $.store_get(a, '$a', $$stores);
	const $b = () => $.store_get(b, '$b', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const a = writable({ foo: 1, bar: 2 });

	$.store_mutate(a, $.untrack($a).foo = 3, $.untrack($a));

	const b = writable({ foo: 1, bar: 2 });

	$.store_set(b, { foo: 3 });

	function update() {
		$.store_mutate(a, $.untrack($a).foo = $a().foo + 1, $.untrack($a));
		$.store_set(b, { foo: $b().foo + 1, qux: 0 });
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var button = $.sibling(p_1, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `a: ${$0 ?? ''}`);
			$.set_text(text_1, `b: ${$1 ?? ''}`);
		},
		[() => JSON.stringify($a()), () => JSON.stringify($b())]
	);

	$.event('click', button, () => {
		$.store_mutate(a, $.untrack($a).foo = $a().foo + 1, $.untrack($a));
		$.store_set(b, { foo: $b().foo + 1, baz: 0 });
	});

	$.event('click', button_1, update);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}