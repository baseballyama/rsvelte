import * as $ from 'svelte/internal/server';
import { text } from './utils.js';

export default function Newsletter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Email capture band. Submission is wired by the store's newsletter plugin, not the theme. */
		let { ctx, options = {} } = $$props;

		const label = $.derived(() => text(ctx, options.label));
		const title = $.derived(() => text(ctx, options.title));
		const titleSuffix = $.derived(() => text(ctx, options.titleSuffix));
		const body = $.derived(() => text(ctx, options.text));
		const placeholder = $.derived(() => text(ctx, options.placeholder));
		const cta = $.derived(() => text(ctx, options.cta));
		const privacy = $.derived(() => text(ctx, options.privacy));
		let email = '';

		$$renderer.push(`<section${$.attr_class(`ts-newsletter ${$.stringify(options.class ?? '')}`)}><div class="ts-newsletter-copy">`);

		if (label()) {
			$$renderer.push(`<!--[0--><p>${$.escape(label())}</p>`);
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
			$$renderer.push(`<!--[0--><p class="ts-newsletter-text">${$.escape(body())}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <form><input type="email"${$.attr('value', email)}${$.attr('placeholder', placeholder())} aria-label="Email address"/> <button type="submit">${$.escape(cta())}</button></form> `);

		if (privacy()) {
			$$renderer.push(`<!--[0--><small class="ts-newsletter-privacy">${$.escape(privacy())}</small>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section>`);
	});
}