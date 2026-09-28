import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isSmallViewport } from '$lib/stores/viewport';
import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
import { Button, Icon, Layout } from '@appwrite.io/pink-svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'href',
	'collapsed',
	'children'
]);

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<!> <h1 class="animated-title svelte-s4ymcr"><!></h1>`, 1);

export default function AnimatedTitle($$anchor, $$props) {
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let href = $.prop($$props, 'href', 3, null),
		collapsed = $.prop($$props, 'collapsed', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const buttonSize = $.derived(() => collapsed() ? 'xs' : 's');
	const currentLineHeight = $.derived(() => collapsed() ? '130%' : '140%');
	const currentLetterSpacing = $.derived(() => collapsed() ? '0' : '-0.144px');
	const currentFontSize = $.derived(() => collapsed() ? 'var(--font-size-l)' : 'var(--font-size-xxl)');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, $.spread_props(
			{
				inline: true,
				gap: 'xs',
				direction: 'row',
				alignItems: 'center',
				justifyContent: 'center'
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var span = root();

							$.set_style(span, '', {}, { position: 'relative' });

							var node_2 = $.child(span);

							$.component(node_2, () => Button.Anchor, ($$anchor, Button_Anchor) => {
								Button_Anchor($$anchor, {
									get size() {
										return $.get(buttonSize);
									},
									icon: true,
									variant: 'text',
									get href() {
										return href();
									},
									'aria-label': 'page back',
									children: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											get icon() {
												return IconChevronLeft;
											}
										});
									},
									$$slots: { default: true }
								});
							});

							$.reset(span);
							$.append($$anchor, span);
						};

						$.if(node_1, ($$render) => {
							if (href() && !$isSmallViewport()) $$render(consequent);
						});
					}

					var h1 = $.sibling(node_1, 2);
					let styles;
					var node_3 = $.child(h1);

					$.snippet(node_3, () => $$props.children);
					$.reset(h1);

					$.template_effect(() => styles = $.set_style(h1, '', styles, {
						'font-size': $.get(currentFontSize),
						'line-height': $.get(currentLineHeight),
						'letter-spacing': $.get(currentLetterSpacing)
					}));

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$$cleanup();
}