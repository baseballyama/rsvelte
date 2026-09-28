import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>A</span>`);
var root_1 = $.from_html(`<button>toggle <!></button>`);

export default function A($$anchor) {
	let open = $.state(false);
	let menuOptionsEl = $.state(null);
	var button = root_1();
	var node = $.sibling($.child(button));

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.bind_this(span, ($$value) => $.set(menuOptionsEl, $$value), () => $.get(menuOptionsEl));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent);
		});
	}

	$.reset(button);
	$.delegated('click', button, () => $.set(open, !$.get(open)));
	$.append($$anchor, button);
}

$.delegate(['click']);