import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from '$lib/index.js';
import CodeBlock from './CodeBlock.svelte';

var root = $.from_html(`<div><h2>Expand</h2> <p>You can change the amount of toasts visible through the <code>visibleToasts</code> prop.</p> <div class="buttons"><button class="button">Expand</button> <button class="button">Default</button></div> <!></div>`);

export default function Expand($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.sibling($.child(div), 4);
	var button = $.child(div_1);
	var button_1 = $.sibling(button, 2);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => `<Toaster expand={${$$props.expand}} />`);

		CodeBlock(node, {
			get code() {
				return $.get($0);
			}
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'data-active', $$props.expand);
		$.set_attribute(button_1, 'data-active', !$$props.expand);
	});

	$.delegated('click', button, () => {
		toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
		$$props.setExpand(true);
	});

	$.delegated('click', button_1, () => {
		toast('Event has been created', { description: 'Monday, January 3rd at 6:00pm' });
		$$props.setExpand(false);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);