import * as $ from 'svelte/internal/server';

import {
	avatarBase,
	avatarImageBase,
	letterBase,
	placeholderBase,
	sizeStyle,
	fontSizeStyle
} from "./styles.js";

import { resolveAvatarSrc, normalizeLetter, shouldShowImage } from "./utils.js";

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size = 32,
			src,
			username,
			letter,
			placeholder = false,
			title,
			class: klass,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let resolvedTitle = $.derived(() => title || username);
		let resolvedSrc = $.derived(() => resolveAvatarSrc({ src, username }, size));
		let resolvedLetter = $.derived(() => normalizeLetter(letter));
		let img = void 0;
		let erroredSrc = undefined;

		function onError() {
			erroredSrc = resolvedSrc();
		}

		let showImage = $.derived(() => shouldShowImage(resolvedSrc(), erroredSrc));
		let showLetter = $.derived(() => !showImage() && resolvedLetter() && !placeholder);
		let showPlaceholder = $.derived(() => placeholder || !showImage() && !showLetter());

		if (showImage()) {
			$$renderer.push(`<!--[0--><span${$.attributes({
				...rest,
				class: $.clsx([avatarBase, klass]),
				style: sizeStyle(size),
				title: resolvedTitle()
			})}><img${$.attr('src', resolvedSrc())}${$.attr('alt', resolvedTitle() ? `${resolvedTitle()}'s avatar` : "Avatar")}${$.attr_class($.clsx(avatarImageBase))}${$.attr('width', size)}${$.attr('height', size)} loading="eager" decoding="async" onerror="this.__e=event"/></span>`);
		} else if (showLetter()) {
			$$renderer.push(`<!--[1--><span${$.attributes({
				...rest,
				class: $.clsx([letterBase, klass]),
				style: `${$.stringify(sizeStyle(size))}${$.stringify(fontSizeStyle(size))}`,
				title: resolvedTitle(),
				'aria-label': resolvedTitle()
					? `Avatar with initials: ${resolvedLetter()} for ${resolvedTitle()}`
					: `Avatar with initials: ${resolvedLetter()}`
			})}>${$.escape(resolvedLetter())}</span>`);
		} else if (showPlaceholder()) {
			$$renderer.push(`<!--[2--><span${$.attributes({
				...rest,
				class: $.clsx([placeholderBase, klass]),
				style: sizeStyle(size),
				'aria-label': 'Avatar placeholder'
			})}></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}