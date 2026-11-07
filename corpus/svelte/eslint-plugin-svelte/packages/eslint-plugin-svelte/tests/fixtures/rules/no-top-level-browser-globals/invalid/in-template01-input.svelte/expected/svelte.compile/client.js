import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';

var root = $.from_html(` <!> <!> <!> <!>`, 1);

export default function In_template01_input($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `${location.href ?? ''} `;

	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			text_1.nodeValue = location.href;
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (browser) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_2 = $.text();

			text_2.nodeValue = location.href;
			$.append($$anchor, text_2);
		};

		$.if(node_1, ($$render) => {
			if (!browser) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text_3 = $.text();

			text_3.nodeValue = location.href;
			$.append($$anchor, text_3);
		};

		var alternate = ($$anchor) => {
			var text_4 = $.text();

			text_4.nodeValue = location.href;
			$.append($$anchor, text_4);
		};

		$.if(node_2, ($$render) => {
			if (browser) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_5 = $.text();

			text_5.nodeValue = location.href;
			$.append($$anchor, text_5);
		};

		var alternate_1 = ($$anchor) => {
			var text_6 = $.text();

			text_6.nodeValue = location.href;
			$.append($$anchor, text_6);
		};

		$.if(node_3, ($$render) => {
			if (!browser) $$render(consequent_3); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
}