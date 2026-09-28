import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Output($$anchor) {
	FancyList($$anchor, {
		items,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const processed = $.derived(() => $$slotProps.item);
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(processed).text));
				$.append($$anchor, div);
			}
		}
	});
}