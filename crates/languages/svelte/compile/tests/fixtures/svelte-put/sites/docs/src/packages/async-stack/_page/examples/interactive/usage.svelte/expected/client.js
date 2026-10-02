import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { notiStack } from '../comprehensive/notification-stack';
import InteractiveNotification from './InteractiveNotification.svelte';

var root = $.from_html(`Invitation was <span> </span>`, 1);
var root_1 = $.from_html(`<p><!></p> <button class="c-btn">Trigger Interactive Notification</button>`, 1);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	// :::highlight
	// :::
	let state = $.state('idle');

	async function pushNoti() {
		const pushed = notiStack.push('custom', {
			timeout: 0,
			// :::highlight
			component: InteractiveNotification,

			// :::
			props: { message: 'You are invited to join the Svelte community!' }
		});

		$.set(state, 'pending');

		// :::highlight
		const agreed = await pushed.resolution;

		// :::
		$.set(state, agreed ? 'accepted' : 'denied', true);
	}

	var fragment = root_1();
	var p = $.first_child(fragment);
	var node = $.child(p);

	{
		var consequent = ($$anchor) => {
			var text = $.text('Waiting for notification to be pushed');

			$.append($$anchor, text);
		};

		var consequent_1 = ($$anchor) => {
			var text_1 = $.text('Waiting for user action to resolve notification');

			$.append($$anchor, text_1);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root();
			var span = $.sibling($.first_child(fragment_1));
			let classes;
			var text_2 = $.only_child(span, true);

			$.template_effect(() => {
				classes = $.set_class(span, 1, 'px-2', null, classes, {
					'hl-error': $.get(state) == 'denied',
					'hl-success': $.get(state) === 'accepted'
				});

				$.set_text(text_2, $.get(state));
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(state) === 'idle') $$render(consequent); else if ($.get(state) === 'pending') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(p);

	var button = $.sibling(p, 2);

	$.template_effect(() => button.disabled = $.get(state) === 'pending');
	$.delegated('click', button, pushNoti);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);