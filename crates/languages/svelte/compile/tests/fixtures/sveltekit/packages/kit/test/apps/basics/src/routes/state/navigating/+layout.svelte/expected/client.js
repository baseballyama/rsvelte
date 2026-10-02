import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { navigating } from '$app/state';

var root = $.from_html(`<p id="navigating"> </p>`);
var root_1 = $.from_html(`<p id="not-navigating">not currently navigating</p>`);
var root_2 = $.from_html(`<nav><a href="/state/navigating/a">a</a> <a href="/state/navigating/b">b</a> <a href="/state/navigating/c">c</a></nav> <div id="nav-status"><!></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `navigating from ${navigating.from?.url.pathname ?? ''} to ${navigating.to.url.pathname ?? ''} (${navigating.type ?? ''})`));
			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (navigating.to) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}