import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let nested;

	function show() {
		nested.show();
	}

	function hide() {
		nested.hide();
	}

	var $$exports = { show, hide };

	$.bind_this(
		Nested($$anchor, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const data = $.derived(() => $$slotProps.data);

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(data)));
					$.append($$anchor, text);
				}
			}
		}),
		($$value) => nested = $$value,
		() => nested
	);

	return $.pop($$exports);
}