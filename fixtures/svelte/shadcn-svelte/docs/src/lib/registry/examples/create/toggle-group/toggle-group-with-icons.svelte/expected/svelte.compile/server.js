import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
		children: ($$renderer) => {
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
								class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-foreground data-[state=on]:*:[svg]:stroke-foreground',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'StarIcon',
										tabler: 'IconStar',
										hugeicons: 'StarIcon',
										phosphor: 'StarIcon',
										remixicon: 'RiStarLine'
									});

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
								class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-foreground data-[state=on]:*:[svg]:stroke-foreground',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'HeartIcon',
										tabler: 'IconHeart',
										hugeicons: 'FavouriteIcon',
										phosphor: 'HeartIcon',
										remixicon: 'RiHeartLine'
									});

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
								class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-foreground data-[state=on]:*:[svg]:stroke-foreground',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'BookmarkIcon',
										tabler: 'IconBookmark',
										hugeicons: 'BookmarkIcon',
										phosphor: 'BookmarkIcon',
										remixicon: 'RiBookmarkLine'
									});

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
		},
		$$slots: { default: true }
	});
}