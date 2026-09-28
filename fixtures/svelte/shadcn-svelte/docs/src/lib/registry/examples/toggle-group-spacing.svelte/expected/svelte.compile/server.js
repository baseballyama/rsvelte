import * as $ from 'svelte/internal/server';
import BookmarkIcon from "@lucide/svelte/icons/bookmark";
import HeartIcon from "@lucide/svelte/icons/heart";
import StarIcon from "@lucide/svelte/icons/star";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

export default function Toggle_group_spacing($$renderer) {
	if (ToggleGroup.Root) {
		$$renderer.push('<!--[-->');

		ToggleGroup.Root($$renderer, {
			type: 'multiple',
			variant: 'outline',
			spacing: 2,
			size: 'sm',
			children: ($$renderer) => {
				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'star',
						'aria-label': 'Toggle star',
						class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500',
						children: ($$renderer) => {
							StarIcon($$renderer, {});
							$$renderer.push(`<!----> Star`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'heart',
						'aria-label': 'Toggle heart',
						class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-red-500 data-[state=on]:*:[svg]:stroke-red-500',
						children: ($$renderer) => {
							HeartIcon($$renderer, {});
							$$renderer.push(`<!----> Heart`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ToggleGroup.Item) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Item($$renderer, {
						value: 'bookmark',
						'aria-label': 'Toggle bookmark',
						class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500',
						children: ($$renderer) => {
							BookmarkIcon($$renderer, {});
							$$renderer.push(`<!----> Bookmark`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}