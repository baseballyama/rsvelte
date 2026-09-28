import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from './popover';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div><p>This is an example popover.</p></div>`);
var root_1 = $.from_html(`<span><button>Trigger</button> <!></span>`);

export default function Popover_1($$anchor, $$props) {
	$.push($$props, true);

	const popover = new Popover();
	var span = root_1();
	var button = $.child(span);

	$.attribute_effect(button, ($0) => ({ ...$0, class: 'btn preset-filled' }), [() => popover.reference()]);

	var node = $.sibling(button, 2);

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
				[() => popover.floating()]
			);

			$.transition(3, div, () => slide, () => ({ duration: 150 }));
			$.append($$anchor, div);
		};

		var d = $.derived(() => popover.isOpen());

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(span);
	$.append($$anchor, span);
	$.pop();
}