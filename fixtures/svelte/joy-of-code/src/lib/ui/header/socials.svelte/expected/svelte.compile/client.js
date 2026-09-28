import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bluesky, RSS, X, YouTube } from '$lib/icons';
import * as config from '$lib/site/config';

var root = $.from_html(`<div class="socials svelte-21474c"><a target="_blank" rel="noreferrer"><!></a> <a target="_blank" rel="noreferrer"><!></a> <a target="_blank" rel="noreferrer"><!></a> <a href="/rss.xml" target="_blank"><!></a></div>`);

export default function Socials($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var a = $.child(div);
	var node = $.child(a);

	YouTube(node, { width: 24, height: 24, 'aria-label': 'YouTube' });
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_1 = $.child(a_1);

	X(node_1, { width: 24, height: 24, 'aria-label': 'Twitter' });
	$.reset(a_1);

	var a_2 = $.sibling(a_1, 2);
	var node_2 = $.child(a_2);

	Bluesky(node_2, { width: 20, height: 20, 'aria-label': 'Bluesky' });
	$.reset(a_2);

	var a_3 = $.sibling(a_2, 2);
	var node_3 = $.child(a_3);

	RSS(node_3, { width: 24, height: 24, 'aria-label': 'RSS feed' });
	$.reset(a_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(a, 'href', config.youtube);
		$.set_attribute(a_1, 'href', config.twitter);
		$.set_attribute(a_2, 'href', config.bluesky);
	});

	$.append($$anchor, div);
	$.pop();
}