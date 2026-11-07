import * as $ from 'svelte/internal/server';
import { Copy } from '.';
import { Badge, Icon, Code } from '@appwrite.io/pink-svelte';
import { IconCode, IconAndroid, IconFlutter, IconApple } from '@appwrite.io/pink-icons-svelte';

const langArr = ['js', 'html', 'dart', 'kotlin', 'json', 'sh', 'yml', 'swift'];

export function isLanguage(str) {
	return langArr.includes(str);
}

export default function Code_1($$renderer, $$props) {
	let {
		label = null,
		labelIcon = null,
		code,
		language,
		withLineNumbers = false,
		withCopy = false,
		noMargin = false,
		noBoxPadding = false,
		allowScroll = false,
		class: classes = ''
	} = $$props;

	function getIcon(iconName) {
		switch (iconName) {
			case 'code':
				return IconCode;

			case 'android':
				return IconAndroid;

			case 'flutter':
				return IconFlutter;

			case 'apple':
				return IconApple;

			default:
				return null;
		}
	}

	$$renderer.push(`<section${$.attr_class(`box u-overflow-hidden ${$.stringify(classes)}`, 'svelte-1gfff2r', {
		'common-section': !noMargin,
		'noBoxPadding': noBoxPadding,
		'with-scroll': allowScroll
	})}><div class="controls u-position-absolute u-inset-inline-end-8 u-inset-block-start-8 u-flex u-gap-8">`);

	if (label) {
		$$renderer.push('<!--[0-->');

		Badge($$renderer, {
			variant: 'secondary',
			content: label,
			children: ($$renderer) => {
				if (labelIcon) {
					$$renderer.push('<!--[0-->');
					Icon($$renderer, { icon: getIcon(labelIcon), size: 's', slot: 'start' });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (withCopy) {
		$$renderer.push('<!--[0-->');

		Copy($$renderer, {
			value: code,
			children: ($$renderer) => {
				$$renderer.push(`<button class="button is-small is-text is-only-icon" aria-label="copy code"><span class="icon-duplicate" aria-hidden="true"></span></button>`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> `);

	Code($$renderer, {
		code,
		lang: language,
		lineNumbers: withLineNumbers,
		hideHeader: true
	});

	$$renderer.push(`<!----></section>`);
}