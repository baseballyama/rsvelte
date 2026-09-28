import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './Button.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	let text = $.state('click me');
	let text2 = $.state('');
	let spread = { onclick: () => $.set(text, 'click spread') };
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, $.spread_props({ onclick: () => $.set(text, 'click onclick') }, () => spread, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(text)));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	}));

	var node_1 = $.sibling(node, 2);

	Button(node_1, $.spread_props(() => spread, {
		onclick: () => $.set(text, 'click onclick'),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text();

			$.template_effect(() => $.set_text(text_2, $.get(text)));
			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	}));

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, $.spread_props({ onclick: () => $.set(text, 'click onclick') }, () => spread, {
		$$events: { click: () => $.set(text2, '!') },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, `${$.get(text) ?? ''}${$.get(text2) ?? ''}`));
			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	}));

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, $.spread_props(() => spread, {
		onclick: () => $.set(text, 'click onclick'),
		$$events: { click: () => $.set(text2, '?') },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text();

			$.template_effect(() => $.set_text(text_4, `${$.get(text) ?? ''}${$.get(text2) ?? ''}`));
			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	}));

	$.append($$anchor, fragment);
}