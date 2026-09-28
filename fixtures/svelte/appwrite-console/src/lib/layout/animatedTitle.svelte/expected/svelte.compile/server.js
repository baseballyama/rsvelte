import * as $ from 'svelte/internal/server';
import { isSmallViewport } from '$lib/stores/viewport';
import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
import { Button, Icon, Layout } from '@appwrite.io/pink-svelte';

export default function AnimatedTitle($$renderer, $$props) {
	var $$store_subs;

	let {
		href = null,
		collapsed = false,
		children,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	const buttonSize = $.derived(() => collapsed ? 'xs' : 's');
	const currentLineHeight = $.derived(() => collapsed ? '130%' : '140%');
	const currentLetterSpacing = $.derived(() => collapsed ? '0' : '-0.144px');
	const currentFontSize = $.derived(() => collapsed ? 'var(--font-size-l)' : 'var(--font-size-xxl)');

	if (Layout.Stack) {
		$$renderer.push('<!--[-->');

		Layout.Stack($$renderer, $.spread_props([
			{
				inline: true,
				gap: 'xs',
				direction: 'row',
				alignItems: 'center',
				justifyContent: 'center'
			},
			restProps,
			{
				children: ($$renderer) => {
					if (href && !$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
						$$renderer.push(`<!--[0--><span${$.attr_style('', { position: 'relative' })}>`);

						if (Button.Anchor) {
							$$renderer.push('<!--[-->');

							Button.Anchor($$renderer, {
								size: buttonSize(),
								icon: true,
								variant: 'text',
								href,
								'aria-label': 'page back',
								children: ($$renderer) => {
									Icon($$renderer, { icon: IconChevronLeft });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <h1 class="animated-title svelte-s4ymcr"${$.attr_style('', {
						'font-size': currentFontSize(),
						'line-height': currentLineHeight(),
						'letter-spacing': currentLetterSpacing()
					})}>`);

					children($$renderer);
					$$renderer.push(`<!----></h1>`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}