import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { notiStack } from './comprehensive/notification-stack';

var root = $.from_html(
	`Notification is pushed and waiting for resolution. Either click the x button on the
			notification, or <button class="c-link">click here</button> to pop the notification.`,
	1
);

var root_1 = $.from_html(`<p class="mt-2 text-blue-500"><!></p>`);
var root_2 = $.from_html(`<button>Push a persistent notification</button> <!>`, 1);

export default function Await($$anchor, $$props) {
	$.push($$props, true);

	// :::focus
	// :::highlight
	let promise = null;

	// :::
	// :::
	async function pushNoti() {
		// :::focus
		// :::highlight
		const pushed = notiStack.push('info', {
			// :::
			// :::
			timeout: 0,
			props: { content: 'persistent' }
		});

		// :::focus
		// :::highlight
		promise = pushed.resolution;

		await promise;

		// :::
		// :::
		setTimeout(() => promise = null, 2000);
	}

	function popNoti() {
		// :::focus
		// :::highlight
		notiStack.pop();

		// :::
		// :::
	}

	var fragment = root_2();
	var button = $.first_child(fragment);
	let classes;
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_1();
			var node_1 = $.child(p);

			$.await(
				node_1,
				() => promise,
				($$anchor) => {
					var fragment_1 = root();
					var button_1 = $.sibling($.first_child(fragment_1));

					$.next();
					$.delegated('click', button_1, popNoti);
					$.append($$anchor, fragment_1);
				},
				($$anchor) => {
					var text = $.text('Resolved (resetting in 2 seconds)');

					$.append($$anchor, text);
				}
			);

			$.reset(p);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (promise) $$render(consequent);
		});
	}

	$.template_effect(() => {
		button.disabled = !!promise;
		classes = $.set_class(button, 1, 'c-btn', null, classes, { 'bg-gray-500': !!promise });
	});

	$.delegated('click', button, pushNoti);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);