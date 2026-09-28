import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentA from './ComponentA.svelte';
import ComponentB from './ComponentB.svelte';

var root = $.from_html(`<button>a</button> <button>b</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let type = $.state($.proxy(ComponentA));
	let elem = $.state(void 0);

	$.user_effect(() => {
		console.log($.get(elem));
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	$.component(node, () => $.get(type), ($$anchor, $$component) => {
		$.bind_this(
			$$component($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Content');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			}),
			($$value) => $.set(elem, $$value),
			() => $.get(elem)
		);
	});

	$.delegated('click', button, () => {
		$.set(type, ComponentA, true);
	});

	$.delegated('click', button_1, () => {
		$.set(type, ComponentB, true);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);