import * as $ from 'svelte/internal/server';
import { CURRENT_YEAR } from '$const';
import Icon from '$lib/Icon.svelte';
import ProducedBySentry from '$lib/ProducedBySentry.svelte';

export default function Footer($$renderer) {
	$$renderer.push(`<footer class="layout zone svelte-1x8ikni"${$.attr_style('', { '--bg': 'var(--bg-root)', '--fg': 'var(--fg-1)' })}><div><div class="grid"><div class="links-col svelte-1x8ikni"><a href="/shows" class="svelte-1x8ikni">Podcast</a> <a target="_blank" rel="noopener" href="https://feed.syntax.fm" class="svelte-1x8ikni">RSS Feed</a> <a href="/about" class="svelte-1x8ikni">About</a> <a href="/sickpicks" class="svelte-1x8ikni">Sick Picks</a> <a href="/guests" class="svelte-1x8ikni">Guest List</a> <a target="_blank" rel="noopener" href="https://sentry.io/welcome/?utm_medium=site&amp;utm_source=syntax&amp;utm_campaign=syntax-sentry-evergreen&amp;utm_content=footer" class="svelte-1x8ikni">Sentry.io</a></div> <div class="links-col svelte-1x8ikni"><a target="_blank" rel="noopener" href="https://github.com/syntaxfm/website" class="svelte-1x8ikni">Source Code</a> <a href="/system/colors" class="svelte-1x8ikni">Colors</a> <a href="/system/layout" class="svelte-1x8ikni">Layout</a> <a href="/system/typography" class="svelte-1x8ikni">Typography</a> <a href="/system/theme" class="svelte-1x8ikni">Theme</a> <a href="/pages/privacy" class="svelte-1x8ikni">Privacy Policy</a> <a href="/pages/terms-of-service" class="svelte-1x8ikni">Terms of Service</a></div> <div class="links-col social-links svelte-1x8ikni"><a target="_blank" rel="noopener" href="https://x.com/syntaxfm" class="svelte-1x8ikni">`);
	Icon($$renderer, { name: 'x' });
	$$renderer.push(`<!----></a> <a target="_blank" rel="noopener" href="https://github.com/syntaxfm" class="svelte-1x8ikni">`);
	Icon($$renderer, { name: 'github' });
	$$renderer.push(`<!----></a> <a target="_blank" rel="noopener" href="https://discord.gg/W5y68HMfZV" class="svelte-1x8ikni">`);
	Icon($$renderer, { name: 'discord' });
	$$renderer.push(`<!----></a> <a target="_blank" rel="noopener" href="https://www.youtube.com/@syntaxfm" class="svelte-1x8ikni">`);
	Icon($$renderer, { name: 'youtube' });
	$$renderer.push(`<!----></a> <a target="_blank" rel="noopener" href="https://www.tiktok.com/@syntaxfm" class="svelte-1x8ikni">`);
	Icon($$renderer, { name: 'tiktok' });
	$$renderer.push(`<!----></a> <a target="_blank" rel="noopener" href="https://www.instagram.com/syntax_fm/" class="svelte-1x8ikni">`);
	Icon($$renderer, { name: 'instagram' });
	$$renderer.push(`<!----></a></div></div> `);
	ProducedBySentry($$renderer, {});
	$$renderer.push(`<!----> <div><p>©️ ${$.escape(CURRENT_YEAR)} - Sentry.io</p></div></div></footer>`);
}