import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>loading...</p>`);
var root_1 = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const message = $.derived(() => $$slotProps.message);
						var p_1 = root_1();
						var text = $.only_child(p_1, true);

						$.template_effect(() => $.set_text(text, $.get(message)));
						$.append($$anchor, p_1);
					}
				}
			});
		});
	}

	$.append($$anchor, fragment);
}