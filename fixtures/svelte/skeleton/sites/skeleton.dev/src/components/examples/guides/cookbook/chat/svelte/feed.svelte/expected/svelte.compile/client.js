import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<pre class="pre"> </pre>`);
var root_1 = $.from_html(`<section class="w-full max-h-[400px] overflow-y-auto space-y-4"></section>`);

export default function Feed($$anchor) {
	const messageFeed = [
		{
			id: 0,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:30pm',
			message: 'Some message text.',
			color: 'variant-soft-primary'
		},

		{
			id: 1,
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:45pm',
			message: 'Some message text.',
			color: 'variant-soft-primary'
		}
	];

	var section = root_1();

	$.each(section, 21, () => messageFeed, $.index, ($$anchor, bubble) => {
		const role = $.derived(() => $.get(bubble).host === true ? 'host' : 'guest');
		var pre = root();
		var text = $.only_child(pre, true);

		$.template_effect(($0) => $.set_text(text, $0), [
			() => JSON.stringify({ role: $.get(role), ...$.get(bubble) }, null, 2)
		]);

		$.append($$anchor, pre);
	});

	$.reset(section);
	$.append($$anchor, section);
}