import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DocPage } from "@svecodocs/kit";

var root = $.from_html(`<meta name="description"/>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const ogUrl = $.derived(() => `https://runed.dev/og?title=${encodeURIComponent($$props.data.metadata.title)}&description=${encodeURIComponent($$props.data.metadata.description)}`);

	$.head('5dqvvw', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', $$props.data.metadata.description));

		$.deferred_template_effect(() => {
			$.document.title = $$props.data.metadata.title ?? '';
		});

		$.append($$anchor, meta);
	});

	{
		let $0 = $.derived(() => ({ ogImage: { url: $.get(ogUrl), width: "1200", height: "630" } }));

		DocPage($$anchor, $.spread_props(
			{
				get component() {
					return $$props.data.component;
				}
			},
			() => $$props.data.metadata,
			{
				get metadata() {
					return $.get($0);
				}
			}
		));
	}

	$.pop();
}