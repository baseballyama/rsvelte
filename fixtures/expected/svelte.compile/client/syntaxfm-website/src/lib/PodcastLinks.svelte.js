import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PODCAST_LINKS } from '$const';

var root = $.from_html(`<a target="_blank"> </a>`);
var root_1 = $.from_html(`<div class="svelte-cu4gw6"></div>`);

export default function PodcastLinks($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();

	$.each(div, 21, () => PODCAST_LINKS, $.index, ($$anchor, $$item) => {
		let text = () => $.get($$item).text;
		let href = () => $.get($$item).href;
		var a = root();
		var text_1 = $.only_child(a, true);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', href());
				$.set_class(a, 1, `button subscribe subscribe--${$0 ?? ''}`, 'svelte-cu4gw6');
				$.set_text(text_1, text());
			},
			[() => text().toLowerCase().replaceAll(' ', '-')]
		);

		$.append($$anchor, a);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}