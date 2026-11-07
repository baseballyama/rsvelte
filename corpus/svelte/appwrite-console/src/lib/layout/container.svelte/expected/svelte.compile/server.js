import * as $ from 'svelte/internal/server';
import { Layout } from '@appwrite.io/pink-svelte';

export default function Container($$renderer, $$props) {
	let {
		expanded = false,
		slotSpacing = false,
		overlapCover = false,
		paddingInlineEnd = true,
		paddingInlineEndDouble = false,
		insideSideSheet = false,
		databasesScreen = false,
		databasesMainScreen = false,
		expandHeightButton = false,
		size = null,
		children,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	const style = $.derived(() => size
		? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
		: '');

	$$renderer.push(`<div${$.attributes({ ...restProps }, 'svelte-ucqum5', { 'overlap-cover': overlapCover }, { 'container-type': 'inline-size' })}><div${$.attr_style(style())}${$.attr_class('console-container svelte-ucqum5', void 0, {
		'expanded': expanded,
		'slotSpacing': slotSpacing,
		'insideSideSheet': insideSideSheet,
		'databasesScreen': databasesScreen,
		'expandHeightButton': expandHeightButton,
		'databasesMainScreen': databasesMainScreen,
		'paddingInlineEndDouble': paddingInlineEndDouble,
		'paddingInlineEnd': !paddingInlineEnd
	})}>`);

	if (Layout.Stack) {
		$$renderer.push('<!--[-->');

		Layout.Stack($$renderer, {
			gap: 'l',
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div></div>`);
}