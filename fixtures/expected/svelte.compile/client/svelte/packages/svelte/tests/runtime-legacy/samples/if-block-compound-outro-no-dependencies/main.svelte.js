import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $foo = () => $.store_get(foo, '$foo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const foo = writable(true);
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('blah');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					Bar($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if (bar()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($foo()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text_1 = $.text('blah');

			$.append($$anchor, text_1);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			{
				var consequent_3 = ($$anchor) => {
					Baz($$anchor, {});
				};

				$.if(node_3, ($$render) => {
					if (bar) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node_2, ($$render) => {
			if ($foo()) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var text_2 = $.text('blah');

			$.append($$anchor, text_2);
		};

		var consequent_5 = ($$anchor) => {
			Bar($$anchor, {});
		};

		$.if(node_4, ($$render) => {
			if ($foo()) $$render(consequent_4); else if (bar()) $$render(consequent_5, 1);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_6 = ($$anchor) => {
			var text_3 = $.text('blah');

			$.append($$anchor, text_3);
		};

		var consequent_7 = ($$anchor) => {
			Bar($$anchor, {});
		};

		$.if(node_5, ($$render) => {
			if ($foo()) $$render(consequent_6); else if (bar) $$render(consequent_7, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}