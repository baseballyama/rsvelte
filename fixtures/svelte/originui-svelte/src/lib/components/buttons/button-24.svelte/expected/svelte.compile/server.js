import * as $ from 'svelte/internal/server';
import Toggle from '$lib/components/ui/toggle.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import Bookmark from '@lucide/svelte/icons/bookmark';

export default function Button_24($$renderer) {
	let bookmarked = false;

	TooltipProvider($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Toggle($$renderer, $.spread_props([
								{
									class: 'group size-9 p-0 hover:bg-indigo-50 hover:text-indigo-500 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-500',
									pressed: bookmarked,
									onPressedChange: () => bookmarked = !bookmarked
								},
								props,
								{
									children: ($$renderer) => {
										Bookmark($$renderer, $.spread_props([{ size: 16, 'aria-hidden': 'true' }, props]));
									},
									$$slots: { default: true }
								}
							]));
						}

						TooltipTrigger($$renderer, {
							'aria-label': 'Bookmark this',
							child,
							$$slots: { child: true }
						});
					}

					$$renderer.push(`<!----> `);

					TooltipContent($$renderer, {
						class: 'px-2 py-1 text-xs',
						children: ($$renderer) => {
							$$renderer.push(`<p>${$.escape(bookmarked ? 'Remove bookmark' : 'Bookmark this')}</p>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}