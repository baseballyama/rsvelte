import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';
import { themeImage } from '../placeholder.js';
import { get, text } from './utils.js';

var root = $.from_html(`<img decoding="async"/>`);
var root_1 = $.from_html(`<a><!></a>`);
var root_2 = $.from_html(`<section><!></section>`);

export default function Banner($$anchor, $$props) {
	$.push($$props, true);

	const /** A full-width image band: hero, mid-page editorial, campaign. */
	// Route real artwork through the image CDN, the way the product cards already do — this band
	// used to serve the full-resolution original. Generated placeholders are data: URIs, which
	// the CDN URL builder would mangle, so they are passed through untouched.
	// `options.priority: true` marks the first banner on the page — normally the LCP element.
	// Everything else is lazy so a mid-page band never competes with above-the-fold work.
	// Intrinsic size, so the browser reserves the band's height before the image arrives
	// (this is the LCP element on every section-driven theme and had no reserved height at all).
	// Expressed as width/height attributes rather than CSS on purpose: the section library is
	// styled by the store-injected `store.themeCss`, and a scoped rule here would outrank it.
	media = ($$anchor) => {
		var img = root();

		$.set_attribute(img, 'width', $.get(width));

		$.template_effect(() => {
			$.set_attribute(img, 'src', $.get(src));
			$.set_attribute(img, 'alt', $.get(alt));
			$.set_attribute(img, 'height', $.get(height));
			$.set_attribute(img, 'loading', $.get(priority) ? 'eager' : 'lazy');
			$.set_attribute(img, 'fetchpriority', $.get(priority) ? 'high' : 'auto');
		});

		$.append($$anchor, img);
	};

	let options = $.prop($$props, 'options', 19, () => ({}));
	const rawSrc = $.derived(() => themeImage(get($$props.ctx.content, options().image), options().seed ?? options().image));

	const src = $.derived(() => (/^https?:/i).test($.get(rawSrc))
		? getImageCDNUrl($.get(rawSrc), 1600, 0)
		: $.get(rawSrc));

	const alt = $.derived(() => text($$props.ctx, options().alt));
	const ariaLabel = $.derived(() => text($$props.ctx, undefined, options().ariaLabel));
	const priority = $.derived(() => options().priority === true);

	const $$d = $.derived(() => {
			const parts = String(options().aspect ?? '16/9').split(/[/:]/).map((part) => Number(part.trim()));

			return parts.length === 2 && parts.every((n) => Number.isFinite(n) && n > 0) ? parts : [16, 9];
		}),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectW = $.derived(() => $.get($$array)[0]),
		aspectH = $.derived(() => $.get($$array)[1]);

	const width = $.derived(() => 1600);
	const height = $.derived(() => Math.round(1600 * $.get(aspectH) / $.get(aspectW)));
	var section = root_2();
	var node = $.child(section);

	{
		var consequent = ($$anchor) => {
			var a = root_1();
			var node_1 = $.child(a);

			media(node_1);
			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', options().href));
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			media($$anchor);
		};

		$.if(node, ($$render) => {
			if (options().href) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(section);

	$.template_effect(() => {
		$.set_class(section, 1, `ts-banner ${options().class ?? '' ?? ''}`);
		$.set_attribute(section, 'aria-label', $.get(ariaLabel) || undefined);
	});

	$.append($$anchor, section);
	$.pop();
}