import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Toggle from '$lib/components/ui/toggle.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import Bookmark from '@lucide/svelte/icons/bookmark';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_24($$anchor) {
	let bookmarked = $.state(false);

	TooltipProvider($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Toggle($$anchor, $.spread_props(
								{
									class: 'group size-9 p-0 hover:bg-indigo-50 hover:text-indigo-500 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-500',
									get pressed() {
										return $.get(bookmarked);
									},
									onPressedChange: () => $.set(bookmarked, !$.get(bookmarked))
								},
								props,
								{
									children: ($$anchor, $$slotProps) => {
										Bookmark($$anchor, $.spread_props({ size: 16, 'aria-hidden': 'true' }, props));
									},
									$$slots: { default: true }
								}
							));
						};

						TooltipTrigger(node, {
							'aria-label': 'Bookmark this',
							child,
							$$slots: { child: true }
						});
					}

					var node_1 = $.sibling(node, 2);

					TooltipContent(node_1, {
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							var p = root();
							var text = $.only_child(p, true);

							$.template_effect(() => $.set_text(text, $.get(bookmarked) ? 'Remove bookmark' : 'Bookmark this'));
							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}