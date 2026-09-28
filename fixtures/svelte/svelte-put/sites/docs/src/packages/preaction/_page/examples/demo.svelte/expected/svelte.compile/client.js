import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { make, apply } from '@svelte-put/preaction';

var root = $.from_html(`<button>Open Popover</button> <div>My simple popover</div>`, 1);

export default function Demo($$anchor, $$props) {
	$.push($$props, true);

	// :::highlight
	// :::
	const popover = {
		// :::highlight
		control: make((id) => {
			// :::
			return {
				action: (node) => {
					// regular runtime Svelte action business
					console.log('popover control', node);
				},

				attributes: {
					popovertarget: id,
					class: 'c-btn',
					popovertargetaction: 'show'
				}
			};
		}),

		// :::highlight
		target: make((id) => {
			// :::
			return {
				action: (node) => {
					// regular runtime Svelte action business
					console.log('popover target', node);
				},
				attributes: { id, class: 'border-2 p-10 m-auto', popover: 'auto' }
			};
		})
	};

	var fragment = root();
	var button = $.first_child(fragment);

	$.action(button, ($$node, $$action_arg) => apply?.($$node, $$action_arg), () => popover.control('my-popover'));

	var div = $.sibling(button, 2);

	$.action(div, ($$node, $$action_arg) => apply?.($$node, $$action_arg), () => popover.target('my-popover'));
	$.append($$anchor, fragment);
	$.pop();
}