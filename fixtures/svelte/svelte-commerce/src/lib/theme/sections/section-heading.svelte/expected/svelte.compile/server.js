import * as $ from 'svelte/internal/server';
import { text } from './utils.js';

export default function Section_heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * The heading block every section shares: eyebrow, title (optionally split so a theme can
		 * accent the second half), supporting copy and a "view all" link. Which of those appear is
		 * decided entirely by the theme's section options.
		 */
		let { ctx, options = {} } = $$props;

		const label = $.derived(() => text(ctx, options.label));
		const title = $.derived(() => text(ctx, options.title));
		const titleSuffix = $.derived(() => text(ctx, options.titleSuffix));
		const body = $.derived(() => text(ctx, options.text));
		const cta = $.derived(() => text(ctx, options.cta));

		if (label() || title() || body() || cta()) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`ts-heading ${$.stringify(options.class ?? '')}`)}>`);

			if (label()) {
				$$renderer.push(`<!--[0--><span${$.attr_class(`ts-heading-label ${$.stringify(options.labelClass ?? '')}`)}>${$.escape(label())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (title()) {
				$$renderer.push(`<!--[0--><h2>${$.escape(title())}`);

				if (titleSuffix()) {
					$$renderer.push(`<!--[0--> <span>${$.escape(titleSuffix())}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></h2>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (body()) {
				$$renderer.push(`<!--[0--><p>${$.escape(body())}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (cta()) {
				$$renderer.push(`<!--[0--><a${$.attr('href', options.ctaHref ?? '/products')}>${$.escape(cta())}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}