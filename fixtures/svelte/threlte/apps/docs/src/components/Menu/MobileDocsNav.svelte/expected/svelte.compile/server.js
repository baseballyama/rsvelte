import * as $ from 'svelte/internal/server';
import Details from './Details.svelte';
import LeftSidebarCategory from './LeftSidebar/LeftSidebarCategory.svelte';
import MobileNav from './MobileNav.svelte';

export default function MobileDocsNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['learn', 'reference', 'examples'];

		let {
			sidebarMenu,
			activeSidebarTab,
			activeUrlPathName,
			baseUrl,
			logo,
			socials
		} = $$props;

		{
			function topbarLeft($$renderer) {
				$$renderer.push(`<a class="flex flex-row gap-3"${$.attr('href', import.meta.env.BASE_URL)}>`);
				logo?.($$renderer);
				$$renderer.push(`<!----></a>`);
			}

			function content($$renderer) {
				$$renderer.push(`<div class="flex flex-col gap-4 text-lg"><ul class="flex flex-col gap-2 overflow-y-auto"><!--[-->`);

				const each_array = $.ensure_array_like(keys);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let key = each_array[$$index_1];

					$$renderer.push(`<li>`);

					{
						function summary($$renderer) {
							$$renderer.push(`<div class="font-normal">`);

							if (key === 'learn') {
								$$renderer.push(`<!--[0-->Learn`);
							} else if (key === 'reference') {
								$$renderer.push(`<!--[1-->Reference`);
							} else if (key === 'examples') {
								$$renderer.push(`<!--[2-->Examples`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						Details($$renderer, {
							id: key,
							open: activeSidebarTab === key,
							summary,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(sidebarMenu[key].categories);

								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let category = each_array_1[$$index];

									$$renderer.push(`<li class="mt-2 mb-0 ml-4 text-sm">`);
									LeftSidebarCategory($$renderer, { category, activeUrlPathName, baseUrl });
									$$renderer.push(`<!----></li>`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { summary: true, default: true }
						});
					}

					$$renderer.push(`<!----></li>`);
				}

				$$renderer.push(`<!--]--></ul> <hr/>  `);
				socials?.($$renderer);
				$$renderer.push(`<!----></div>`);
			}

			MobileNav($$renderer, {
				search: true,
				topbarLeft,
				content,
				$$slots: { topbarLeft: true, content: true }
			});
		}
	});
}