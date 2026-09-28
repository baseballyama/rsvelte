import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeadNested from './HeadNested.svelte';
import Nested from './Nested.svelte';

var root = $.from_html(`<!> <meta name="main" content="main"/> <!>`, 1);

export default function Main($$anchor) {
	$.head('1bef04p', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.html(node_1, () => '<meta name="main_html" content="main_html">');

				var node_2 = $.sibling(node_1, 4);

				HeadNested(node_2, {});
				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (true) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	Nested($$anchor, {});
}