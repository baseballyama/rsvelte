import * as $ from 'svelte/internal/server';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';
import { themeImage } from '../placeholder.js';
import { get, text } from './utils.js';

export default function Banner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** A full-width image band: hero, mid-page editorial, campaign. */
		let { ctx, options = {} } = $$props;

		const rawSrc = $.derived(() => themeImage(get(ctx.content, options.image), options.seed ?? options.image));

		// Route real artwork through the image CDN, the way the product cards already do — this band
		// used to serve the full-resolution original. Generated placeholders are data: URIs, which
		// the CDN URL builder would mangle, so they are passed through untouched.
		const src = $.derived(() => (/^https?:/i).test(rawSrc()) ? getImageCDNUrl(rawSrc(), 1600, 0) : rawSrc());

		const alt = $.derived(() => text(ctx, options.alt));
		const ariaLabel = $.derived(() => text(ctx, undefined, options.ariaLabel));

		// `options.priority: true` marks the first banner on the page — normally the LCP element.
		// Everything else is lazy so a mid-page band never competes with above-the-fold work.
		const priority = $.derived(() => options.priority === true);

		// Intrinsic size, so the browser reserves the band's height before the image arrives
		// (this is the LCP element on every section-driven theme and had no reserved height at all).
		// Expressed as width/height attributes rather than CSS on purpose: the section library is
		// styled by the store-injected `store.themeCss`, and a scoped rule here would outrank it.
		const $$d = $.derived(() => {
				const parts = String(options.aspect ?? '16/9').split(/[/:]/).map((part) => Number(part.trim()));

				return parts.length === 2 && parts.every((n) => Number.isFinite(n) && n > 0) ? parts : [16, 9];
			}),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectW = $.derived(() => $$derived_array()[0]),
			aspectH = $.derived(() => $$derived_array()[1]);

		const width = $.derived(() => 1600);
		const height = $.derived(() => Math.round(1600 * aspectH() / aspectW()));

		function media($$renderer) {
			$$renderer.push(`<img${$.attr('src', src())}${$.attr('alt', alt())}${$.attr('width', width())}${$.attr('height', height())}${$.attr('loading', priority() ? 'eager' : 'lazy')}${$.attr('fetchpriority', priority() ? 'high' : 'auto')} decoding="async"/>`);
		}

		$$renderer.push(`<section${$.attr_class(`ts-banner ${$.stringify(options.class ?? '')}`)}${$.attr('aria-label', ariaLabel() || undefined)}>`);

		if (options.href) {
			$$renderer.push(`<!--[0--><a${$.attr('href', options.href)}>`);
			media($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
			media($$renderer);
		}

		$$renderer.push(`<!--]--></section>`);
	});
}