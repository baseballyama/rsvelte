import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../../../styles/pages.scss';
import { site } from '$lib/constants/site';
import { legalPages } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<meta name="description" content="Legal information for Networking Toolbox - privacy policy and license"/> <meta property="og:title"/> <meta property="og:description" content="Privacy policy and MIT license information for Networking Toolbox"/> <meta property="og:url"/>`, 1);
var root_1 = $.from_html(`<a class="legal-card svelte-1hp9pcg"><div class="card-icon svelte-1hp9pcg"><!></div> <div class="card-content svelte-1hp9pcg"><h3 class="svelte-1hp9pcg"> </h3> <p class="svelte-1hp9pcg"> </p></div> <div class="card-arrow svelte-1hp9pcg"><!></div></a>`);

var root_2 = $.from_html(
	`<div class="hero svelte-1hp9pcg"><h2 class="svelte-1hp9pcg">Legal Information</h2> <p class="lead svelte-1hp9pcg">Boring (but important) stuff</p></div> <section class="legal-links svelte-1hp9pcg"></section> <section class="summary svelte-1hp9pcg"><h3 class="svelte-1hp9pcg">Summary</h3> <p class="svelte-1hp9pcg">Networking Toolbox is open source software licensed under the MIT License. We respect your privacy and process most
    data locally in your browser. For more details, please review the individual documents above.</p></section>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment_1 = root_2();

	$.head('1hp9pcg', ($$anchor) => {
		var fragment = root();
		var meta = $.sibling($.first_child(fragment), 2);
		var meta_1 = $.sibling(meta, 4);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', `Legal | ${site.title ?? ''}`);
			$.set_attribute(meta_1, 'content', `${site.url ?? ''}/about/legal`);
		});

		$.effect(() => {
			$.document.title = 'Legal | Networking Toolbox';
		});

		$.append($$anchor, fragment);
	});

	var section = $.sibling($.first_child(fragment_1), 2);

	$.each(section, 21, () => legalPages, (page) => page.href, ($$anchor, page) => {
		var a = root_1();
		var div = $.child(a);
		var node = $.child(div);

		{
			let $0 = $.derived(() => $.get(page).icon || 'info');

			Icon(node, {
				get name() {
					return $.get($0);
				},
				size: 'lg'
			});
		}

		$.reset(div);

		var div_1 = $.sibling(div, 2);
		var h3 = $.child(div_1);
		var text = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_1);

		var div_2 = $.sibling(div_1, 2);
		var node_1 = $.child(div_2);

		Icon(node_1, { name: 'arrow-right', size: 'sm' });
		$.reset(div_2);
		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(page).href);
			$.set_text(text, $.get(page).label);
			$.set_text(text_1, $.get(page).description);
		});

		$.append($$anchor, a);
	});

	$.reset(section);
	$.next(2);
	$.append($$anchor, fragment_1);
	$.pop();
}