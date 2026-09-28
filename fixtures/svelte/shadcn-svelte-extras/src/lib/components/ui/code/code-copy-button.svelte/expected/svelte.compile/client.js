import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from '$lib/components/ui/copy-button';
import { cn } from '$lib/utils.js';
import { useCodeCopyButton } from './code.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'variant',
	'size',
	'class'
]);

export default function Code_copy_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'ghost'),
		size = $.prop($$props, 'size', 3, 'icon'),
		rest = $.rest_props($$props, rest_excludes);

	const copyButton = useCodeCopyButton();

	{
		let $0 = $.derived(() => cn('absolute top-2 right-2', $$props.class));

		CopyButton($$anchor, $.spread_props(
			{
				get class() {
					return $.get($0);
				},

				get text() {
					return copyButton.code;
				},
				tabindex: -1,
				get variant() {
					return variant();
				},

				get size() {
					return size();
				}
			},
			() => rest,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}
		));
	}

	$.pop();
}