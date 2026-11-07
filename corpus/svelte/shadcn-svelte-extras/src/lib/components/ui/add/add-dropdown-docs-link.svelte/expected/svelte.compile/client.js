import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import ExternalLink from '@lucide/svelte/icons/external-link';
import { cn } from '$lib/utils';
import { useAddDropdownDocsLink } from './add.svelte.js';
import { mergeProps } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> <span class="text-sm">View CLI docs</span>`, 1);

export default function Add_dropdown_docs_link($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const docs = useAddDropdownDocsLink();
	const merged = $.derived(() => mergeProps(rest, docs.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('', $$props.class));

		$.component(node, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
			DropdownMenu_Item($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => $.get(merged),
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						ExternalLink(node_1, { class: 'size-4' });
						$.next(2);
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