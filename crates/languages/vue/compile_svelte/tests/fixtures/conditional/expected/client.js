import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { toDisplayString } from 'vue';

var root = $.from_html(`<p class="details">Details are visible.</p>`);

var root_1 = $.from_html(`<p class="hint">Nothing to see.</p>`);

var root_2 = $.from_html(`<button class="toggle"> </button><!>`, 1);

export default function Conditional_vue($$anchor, $$props) {
	$.push($$props, true);
	let open = $.state(false);
	var fragment = root_2();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button);
	{
		var consequent = ($$anchor) => {
			var p = root();
			$.append($$anchor, p);
		};
		var alternate = ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		};
		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent); else $$render(alternate, -1);
		});
	}
	$.template_effect(($0) => $.set_text(text, $0), [() => toDisplayString($.get(open) ? 'Hide' : 'Show')]);
	$.delegated('click', button, (event) => $.set(open, !$.get(open)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
