import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Child from './Child.svelte';

var root = $.from_html(`<!> <!> <p> </p> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $a = () => $.store_get(a, '$a', $$stores);
	const $b = () => $.store_get(b, '$b', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let a = writable({ value: 0 });
	let b = writable({ nested: { value: 0 } });
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get value() {
			return $a().value;
		},

		set value($$value) {
			$.store_mutate(a, $.untrack($a).value = $$value, $.untrack($a));
		}
	});

	var node_1 = $.sibling(node, 2);

	Child(node_1, {
		get value() {
			return $b().nested.value;
		},

		set value($$value) {
			$.store_mutate(b, $.untrack($b).nested.value = $$value, $.untrack($b));
		}
	});

	var p = $.sibling(node_1, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(() => {
		$.set_text(text, $a().value);
		$.set_text(text_1, $b().nested.value);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}