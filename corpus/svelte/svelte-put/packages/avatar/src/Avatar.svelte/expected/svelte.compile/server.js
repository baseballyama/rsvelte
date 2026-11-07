import * as $ from 'svelte/internal/server';
import { resolveAlt, resolveSize, resolveSrc, DEFINITIVE_FALLBACK } from './avatar.utils.js';

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./types.public').AvatarProps} */
		let {
			src,
			gravatar,
			uiAvatar,
			fallback,
			size,
			alt,
			class: cls = '',
			img,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let rAlt = $.derived(() => resolveAlt(alt, gravatar, uiAvatar, src));
		let rSize = $.derived(() => resolveSize(32, size, src, gravatar, uiAvatar));
		let sources = $.derived(() => resolveSrc(src, gravatar, uiAvatar, fallback));
		let rSrc = DEFINITIVE_FALLBACK;

		/** @type {HTMLImageElement | undefined} */
		let element = undefined;

		if (img) {
			$$renderer.push('<!--[0-->');
			img($$renderer, { src: rSrc, size: rSize(), alt: rAlt(), sources: sources() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attributes({
				src: rSrc,
				alt: rAlt(),
				height: rSize(),
				width: rSize(),
				class: `svelte-put-avatar ${$.stringify(cls)}`,
				'data-sources': sources().join(','),
				...rest
			})} onload="this.__e=event" onerror="this.__e=event"/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}