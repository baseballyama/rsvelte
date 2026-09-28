import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';

var root = $.from_html(`<button class="button"> </button>`);
var root_1 = $.from_html(`<div><h2>Position</h2> <p>Swipe direction changes depending on the position.</p> <div class="buttons"></div> <!></div>`);

export default function Position($$anchor, $$props) {
	$.push($$props, true);

	const positions = [
		'top-left',
		'top-center',
		'top-right',
		'bottom-left',
		'bottom-center',
		'bottom-right'
	];

	var div = root_1();
	var div_1 = $.sibling($.child(div), 4);

	$.each(div_1, 20, () => positions, (pos) => pos, ($$anchor, pos) => {
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => {
			$.set_attribute(button, 'data-active', $$props.position === pos);
			$.set_text(text, pos);
		});

		$.delegated('click', button, () => {
			const toastsAmount = document.querySelectorAll('[data-sonner-toast]').length;

			$$props.setPosition(pos);

			// No need to show a toast when there is already one
			if (toastsAmount > 0 && pos !== $$props.position) return;

			toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
		});

		$.append($$anchor, button);
	});

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => `<Toaster position="${$$props.position}" />`);

		CodeBlock(node, {
			get code() {
				return $.get($0);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);