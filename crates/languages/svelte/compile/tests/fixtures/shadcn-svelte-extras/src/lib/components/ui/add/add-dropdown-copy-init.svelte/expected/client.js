import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { useAddDropdownCopyInit } from './add.svelte.js';
import { mergeProps } from 'bits-ui';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<span class="text-xs"> </span> <span class="text-muted-foreground text-start text-xs"> </span>`, 1);

export default function Add_dropdown_copy_init($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const dropdownCopyInitState = useAddDropdownCopyInit();
	const mergedProps = $.derived(() => mergeProps(rest, dropdownCopyInitState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('flex flex-col place-items-start! gap-1', $$props.class));

		$.component(node, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
			DropdownMenu_Item($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => $.get(mergedProps),
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var span = $.first_child(fragment_1);
						var text = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_1 = $.only_child(span_1, true);

						$.template_effect(() => {
							$.set_text(text, dropdownCopyInitState.root.initCommand);
							$.set_text(text_1, dropdownCopyInitState.initHint);
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}