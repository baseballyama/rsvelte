import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { modalStack } from './modal-stack';

var root = $.from_html(`<div class="pointer-events-auto h-full w-full"></div>`);
var root_1 = $.from_html(`<aside class="z-modal pointer-events-none fixed inset-0"></aside>`);

export default function ModalPortal($$anchor, $$props) {
	$.push($$props, true);

	var aside = root_1();

	$.each(aside, 21, () => modalStack.items, (modal) => modal.config.id, ($$anchor, modal) => {
		var div = root();

		$.action(div, ($$node, $$action_arg) => modalStack.actions.render?.($$node, $$action_arg), () => $.get(modal));
		$.append($$anchor, div);
	});

	$.reset(aside);
	$.append($$anchor, aside);
	$.pop();
}