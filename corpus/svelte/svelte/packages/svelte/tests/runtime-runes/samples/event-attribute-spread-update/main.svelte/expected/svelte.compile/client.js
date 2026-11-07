import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>change handlers</button> <button>remove capture handler</button> <button> </button>`, 1);

export default function Main($$anchor) {
	let delegated = $.state(0);
	let non_delegated = $.state(0);

	let attrs = $.state($.proxy({
		onclick: () => {
			$.set(delegated, $.get(delegated) + 1);
		},

		onclickcapture: () => {
			$.set(non_delegated, $.get(non_delegated) + 1);
		}
	}));

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.attribute_effect(button_2, () => ({ ...$.get(attrs) }));

	var text = $.only_child(button_2);

	$.template_effect(() => $.set_text(text, `${$.get(delegated) ?? ''} / ${$.get(non_delegated) ?? ''}`));

	$.delegated('click', button, () => $.set(
		attrs,
		{
			onclick: () => {
				$.set(delegated, $.get(delegated) + 2);
			},

			onclickcapture: () => {
				$.set(non_delegated, $.get(non_delegated) + 2);
			}
		},
		true
	));

	$.delegated('click', button_1, () => $.set(attrs, { onclick: $.get(attrs).onclick, onclickcapture: undefined }, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);