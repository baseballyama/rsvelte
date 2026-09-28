import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div class="loading-indicator" data-testid="loading-indicator"></div>`);
var root_1 = $.from_html(`<div class="bg-muted absolute right-0 bottom-0 left-0 h-px"></div> <!>`, 1);

export default function LoadingIndicator($$anchor, $$props) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(3, div, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.isLoading) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}