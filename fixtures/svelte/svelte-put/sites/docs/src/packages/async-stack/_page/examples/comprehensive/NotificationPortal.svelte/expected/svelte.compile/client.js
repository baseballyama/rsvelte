import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';
import { fly, fade } from 'svelte/transition';
import { notiStack } from './notification-stack';

var root = $.from_html(`<div class="relative w-full"></div>`);
var root_1 = $.from_html(`<aside class="z-notification pointer-events-none fixed inset-y-0 right-0 flex flex-col-reverse justify-end gap-4 p-10 md:left-1/2 md:justify-start"></aside>`);

export default function NotificationPortal($$anchor, $$props) {
	$.push($$props, true);

	var aside = root_1();

	$.each(aside, 29, () => notiStack.items, (notification) => notification.config.id, ($$anchor, notification) => {
		var div = root();

		$.action(div, ($$node, $$action_arg) => notiStack.actions.render?.($$node, $$action_arg), () => $.get(notification));
		$.animation(div, () => flip, () => ({ duration: 200 }));
		$.transition(1, div, () => fly, () => ({ duration: 200, x: 20 }));
		$.transition(2, div, () => fade, () => ({ duration: 120 }));
		$.append($$anchor, div);
	});

	$.reset(aside);
	$.append($$anchor, aside);
	$.pop();
}