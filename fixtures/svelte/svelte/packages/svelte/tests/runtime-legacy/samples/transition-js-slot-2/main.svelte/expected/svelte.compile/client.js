import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let name = 'Foo';
	let visible = true;

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
		name = 'Bar';
	}

	var $$exports = { show, hide };

	Nested($$anchor, {
		get visible() {
			return visible;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, name));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}