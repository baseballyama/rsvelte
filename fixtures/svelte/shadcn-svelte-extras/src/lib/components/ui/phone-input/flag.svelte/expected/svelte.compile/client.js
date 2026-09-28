import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getFlag } from './flags';

var root = $.from_html(`<span class="bg-foreground/20 flex h-4 w-6 shrink-0 overflow-clip rounded-sm [&amp;>svg]:h-4! [&amp;>svg]:w-6!"><!></span>`);

export default function Flag($$anchor, $$props) {
	$.push($$props, true);

	let country = $.prop($$props, 'country', 3, null);
	var span = root();
	var node = $.child(span);

	$.await(node, () => getFlag(country()), null, ($$anchor, flag) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.html(node_2, () => $.get(flag));
				$.append($$anchor, fragment_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(flag)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(span);
	$.append($$anchor, span);
	$.pop();
}