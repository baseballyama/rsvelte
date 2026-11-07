import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from './popover';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div><p>This is an example tooltip.</p></div>`);
var root_1 = $.from_html(`<span><p>This triggers a <span>tooltip</span>.</p> <!></span>`);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	const tooltip = new Popover({ interaction: 'hover', placement: 'top' });
	var span = root_1();
	var p = $.child(span);
	var span_1 = $.sibling($.child(p));

	$.attribute_effect(span_1, ($0) => ({ class: 'underline', ...$0 }), [() => tooltip.reference()]);
	$.next();
	$.reset(p);

	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(
				div,
				($0) => ({
					...$0,
					'data-floating': true,
					class: 'card preset-filled-surface-100-900 z-10 p-4'
				}),
				[() => tooltip.floating()]
			);

			$.transition(3, div, () => fade, () => ({ duration: 150 }));
			$.append($$anchor, div);
		};

		var d = $.derived(() => tooltip.isOpen());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(span);
	$.append($$anchor, span);
	$.pop();
}