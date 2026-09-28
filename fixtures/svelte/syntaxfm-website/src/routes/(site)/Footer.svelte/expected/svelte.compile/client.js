import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CURRENT_YEAR } from '$const';
import Icon from '$lib/Icon.svelte';
import ProducedBySentry from '$lib/ProducedBySentry.svelte';

var root = $.from_html(`<footer class="layout zone svelte-1x8ikni"><div><div class="grid"><div class="links-col svelte-1x8ikni"><a href="/shows" class="svelte-1x8ikni">Podcast</a> <a target="_blank" rel="noopener" href="https://feed.syntax.fm" class="svelte-1x8ikni">RSS Feed</a> <a href="/about" class="svelte-1x8ikni">About</a> <a href="/sickpicks" class="svelte-1x8ikni">Sick Picks</a> <a href="/guests" class="svelte-1x8ikni">Guest List</a> <a target="_blank" rel="noopener" href="https://sentry.io/welcome/?utm_medium=site&amp;utm_source=syntax&amp;utm_campaign=syntax-sentry-evergreen&amp;utm_content=footer" class="svelte-1x8ikni">Sentry.io</a></div> <div class="links-col svelte-1x8ikni"><a target="_blank" rel="noopener" href="https://github.com/syntaxfm/website" class="svelte-1x8ikni">Source Code</a> <a href="/system/colors" class="svelte-1x8ikni">Colors</a> <a href="/system/layout" class="svelte-1x8ikni">Layout</a> <a href="/system/typography" class="svelte-1x8ikni">Typography</a> <a href="/system/theme" class="svelte-1x8ikni">Theme</a> <a href="/pages/privacy" class="svelte-1x8ikni">Privacy Policy</a> <a href="/pages/terms-of-service" class="svelte-1x8ikni">Terms of Service</a></div> <div class="links-col social-links svelte-1x8ikni"><a target="_blank" rel="noopener" href="https://x.com/syntaxfm" class="svelte-1x8ikni"><!></a> <a target="_blank" rel="noopener" href="https://github.com/syntaxfm" class="svelte-1x8ikni"><!></a> <a target="_blank" rel="noopener" href="https://discord.gg/W5y68HMfZV" class="svelte-1x8ikni"><!></a> <a target="_blank" rel="noopener" href="https://www.youtube.com/@syntaxfm" class="svelte-1x8ikni"><!></a> <a target="_blank" rel="noopener" href="https://www.tiktok.com/@syntaxfm" class="svelte-1x8ikni"><!></a> <a target="_blank" rel="noopener" href="https://www.instagram.com/syntax_fm/" class="svelte-1x8ikni"><!></a></div></div> <!> <div><p> </p></div></div></footer>`);

export default function Footer($$anchor) {
	var footer = root();

	$.set_style(footer, '', {}, { '--bg': 'var(--bg-root)', '--fg': 'var(--fg-1)' });

	var div = $.child(footer);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var a = $.child(div_2);
	var node = $.child(a);

	Icon(node, { name: 'x' });
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_1 = $.child(a_1);

	Icon(node_1, { name: 'github' });
	$.reset(a_1);

	var a_2 = $.sibling(a_1, 2);
	var node_2 = $.child(a_2);

	Icon(node_2, { name: 'discord' });
	$.reset(a_2);

	var a_3 = $.sibling(a_2, 2);
	var node_3 = $.child(a_3);

	Icon(node_3, { name: 'youtube' });
	$.reset(a_3);

	var a_4 = $.sibling(a_3, 2);
	var node_4 = $.child(a_4);

	Icon(node_4, { name: 'tiktok' });
	$.reset(a_4);

	var a_5 = $.sibling(a_4, 2);
	var node_5 = $.child(a_5);

	Icon(node_5, { name: 'instagram' });
	$.reset(a_5);
	$.reset(div_2);
	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	ProducedBySentry(node_6, {});

	var div_3 = $.sibling(node_6, 2);
	var p = $.child(div_3);
	var text = $.only_child(p);

	$.reset(div_3);
	$.reset(div);
	$.reset(footer);
	$.template_effect(() => $.set_text(text, `©️ ${CURRENT_YEAR ?? ''} - Sentry.io`));
	$.append($$anchor, footer);
}