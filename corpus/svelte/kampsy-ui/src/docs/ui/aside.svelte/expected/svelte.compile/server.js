import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { Badge } from "$lib/index.js";

export default function Aside($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { asideDataList = undefined } = $$props;

		const setActive = (url) => {
			if (page.url.pathname.endsWith(url)) {
				return "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 ";
			}

			return "text-kui-light-gray-900 dark:text-kui-dark-gray-900";
		};

		$$renderer.push(`<div class="ui-scrollbar h-full w-full overflow-y-auto scroll-smooth px-4 pt-4 pb-3.5">`);

		if (asideDataList) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(asideDataList);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let asideData = each_array[index];

				$$renderer.push(`<div><p class="text-kui-black dark:text-kui-dark-gray-1000 mb-0.5 flex h-10 w-full items-center gap-2 py-1.5 pl-3 text-[14px] leading-5 font-medium capitalize">${$.escape(asideData?.title?.name || "")} `);

				if (asideData?.title?.badge) {
					$$renderer.push('<!--[0-->');

					Badge($$renderer, {
						size: 'sm',
						variant: asideData.title?.badge?.variant || "green",
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(asideData.title?.badge?.name)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></p> <ul class="relative space-y-0.5">`);

				if (asideData.ul) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array_1 = $.ensure_array_like(asideData.ul);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let list = each_array_1[index];

						$$renderer.push(`<li class="py-0.5"><a class="group"${$.attr('href', list?.url || "/#")}><span${$.attr_class(`flex h-10 w-full items-center gap-x-3 ${$.stringify(setActive(list?.url || ''))} group-hover:bg-kui-light-gray-alpha-100 dark:group-hover:bg-kui-dark-gray-alpha-100 group-hover:text-kui-light-gray-1000 dark:group-hover:text-kui-dark-gray-1000 flex items-center rounded-md px-3 py-1.5 text-[14px] leading-5 font-normal capitalize`)}>${$.escape(list?.name || "")} `);

						if (list?.badge) {
							$$renderer.push('<!--[0-->');

							Badge($$renderer, {
								size: 'sm',
								variant: list?.badge?.variant || "green",
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(list?.badge.name)}`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span></a></li>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></ul></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}