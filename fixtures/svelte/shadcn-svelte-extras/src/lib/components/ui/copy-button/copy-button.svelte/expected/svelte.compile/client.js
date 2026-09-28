import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
import { cn } from '$lib/utils.js';
import { mergeProps } from 'bits-ui';
import CheckIcon from '@lucide/svelte/icons/check';
import CopyIcon from '@lucide/svelte/icons/copy';
import XIcon from '@lucide/svelte/icons/x';
import { scale } from 'svelte/transition';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'text',
	'icon',
	'animationDuration',
	'variant',
	'size',
	'onCopy',
	'class',
	'tabindex',
	'children'
]);

var root = $.from_html(`<div><!> <span class="sr-only">Copied</span></div>`);
var root_1 = $.from_html(`<div><!> <span class="sr-only">Failed to copy</span></div>`);
var root_2 = $.from_html(`<div><!> <span class="sr-only">Copy</span></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Copy_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		animationDuration = $.prop($$props, 'animationDuration', 3, 500),
		variant = $.prop($$props, 'variant', 3, 'ghost'),
		size = $.prop($$props, 'size', 7, 'icon'),
		rest = $.rest_props($$props, rest_excludes);

	// this way if the user passes text then the button will be the default size
	// svelte-ignore state_referenced_locally
	if (size() === 'icon' && $$props.children) {
		size('default');
	}

	const clipboard = new UseClipboard();

	const merged = $.derived(() => mergeProps(rest, {
		onclick: async () => {
			const status = await clipboard.copy($$props.text);

			$$props.onCopy?.(status);
		}
	}));

	{
		let $0 = $.derived(() => cn('flex items-center gap-2', $$props.class));

		Button($$anchor, $.spread_props(
			{
				get variant() {
					return variant();
				},

				get size() {
					return size();
				},

				get tabindex() {
					return $$props.tabindex;
				},

				get class() {
					return $.get($0);
				},
				type: 'button',
				name: 'copy'
			},
			() => $.get(merged),
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_3();
					var node = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var div = root();
							var node_1 = $.child(div);

							CheckIcon(node_1, { tabindex: -1 });
							$.next(2);
							$.reset(div);
							$.transition(1, div, () => scale, () => ({ duration: animationDuration(), start: 0.85 }));
							$.append($$anchor, div);
						};

						var consequent_1 = ($$anchor) => {
							var div_1 = root_1();
							var node_2 = $.child(div_1);

							XIcon(node_2, { tabindex: -1 });
							$.next(2);
							$.reset(div_1);
							$.transition(1, div_1, () => scale, () => ({ duration: animationDuration(), start: 0.85 }));
							$.append($$anchor, div_1);
						};

						var alternate_1 = ($$anchor) => {
							var div_2 = root_2();
							var node_3 = $.child(div_2);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.snippet(node_4, () => $$props.icon);
									$.append($$anchor, fragment_2);
								};

								var alternate = ($$anchor) => {
									CopyIcon($$anchor, { tabindex: -1 });
								};

								$.if(node_3, ($$render) => {
									if ($$props.icon) $$render(consequent_2); else $$render(alternate, -1);
								});
							}

							$.next(2);
							$.reset(div_2);
							$.transition(1, div_2, () => scale, () => ({ duration: animationDuration(), start: 0.85 }));
							$.append($$anchor, div_2);
						};

						$.if(node, ($$render) => {
							if (clipboard.status === 'success') $$render(consequent); else if (clipboard.status === 'failure') $$render(consequent_1, 1); else $$render(alternate_1, -1);
						});
					}

					var node_5 = $.sibling(node, 2);

					$.snippet(node_5, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}