import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import RobotoFont from "./FonttRoboto.svelte";

var root = $.from_html(`<link rel="preconnect" href="https://cdn.svar.dev" crossorigin=""/> <!> <link rel="stylesheet" href="https://cdn.svar.dev/fonts/wxi/wx-icons.css"/>`, 1);
var root_1 = $.from_html(`<div class="wx-material-theme" style="height:100%"><!></div>`);

export default function Material($$anchor, $$props) {
	$.push($$props, true);

	let fonts = $.prop($$props, 'fonts', 3, true);

	setContext("wx-theme", "material");

	var fragment_2 = $.comment();

	$.head('18cl9nb', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var node_1 = $.sibling($.first_child(fragment_1), 2);

				RobotoFont(node_1, {});
				$.next(2);
				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (fonts()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_2 = $.first_child(fragment_2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var node_3 = $.child(div);

			$.snippet(node_3, () => $$props.children);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node_2, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}