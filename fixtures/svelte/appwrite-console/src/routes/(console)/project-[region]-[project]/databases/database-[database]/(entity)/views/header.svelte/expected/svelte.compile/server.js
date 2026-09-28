import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Cover } from '$lib/layout';
import { AnimatedTitle } from '$lib/layout';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Layout } from '@appwrite.io/pink-svelte';
import { useTerminology } from '$database/(entity)';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { expandTabs } from '$database/store';
import { preferences } from '$lib/stores/preferences';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { entity, tabs } = $$props;

		/**
		 * `useTerminology` is needed because -
		 * 1. headers are initialized **before** content,
		 * 2. `getTerminologies` isn't available at that point.
		 */
		const terminology = useTerminology(page);

		const parentHref = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params));

		const basePath = $.derived(() => {
			const entityType = terminology.entity.lower.singular;

			return withPath(resolveRoute(`/(console)/project-[region]-[project]/databases/database-[database]`, page.params), `${entityType}-${entity.$id}`);
		});

		const nonSheetPages = $.derived(() => {
			const field = terminology.field.lower.plural;
			const entityType = terminology.entity.lower.singular;
			const resourceSeg = `${entityType}-[${entityType}]`;

			const endings = [
				resourceSeg,
				`${resourceSeg}/${field}`,
				`${resourceSeg}/indexes`
			];

			const isSpreadsheetPage = endings.some((end) => page.route.id?.endsWith(end));

			return !isSpreadsheetPage;
		});

		$$renderer.push(`<div${$.attr_class('svelte-19lt5mc', void 0, { 'nonSheetPages': nonSheetPages() })}>`);

		Cover($$renderer, {
			animate: true,
			expanded: true,
			collapsed: !$.store_get($$store_subs ??= {}, '$expandTabs', expandTabs),
			blocksize: $.store_get($$store_subs ??= {}, '$expandTabs', expandTabs) ? '152px' : '90px',
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class('tabs-container svelte-19lt5mc', void 0, {
					'collapsed': !$.store_get($$store_subs ??= {}, '$expandTabs', expandTabs)
				})}>`);

				Tabs($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(tabs);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tab = each_array[$$index];

							Tab($$renderer, {
								href: tab.href,
								selected: isTabSelected(tab, page.url.pathname, basePath(), tabs),
								event: tab.event,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tab.title)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},

			$$slots: {
				default: true,
				header: ($$renderer) => {
					{
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								alignContent: 'center',
								alignItems: 'center',
								inline: true,
								children: ($$renderer) => {
									AnimatedTitle($$renderer, {
										href: parentHref(),
										collapsed: !$.store_get($$store_subs ??= {}, '$expandTabs', expandTabs),
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(entity.name)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <!---->`);

									{
										Id($$renderer, {
											value: entity.$id,
											tooltipPlacement: $.store_get($$store_subs ??= {}, '$expandTabs', expandTabs) ? undefined : 'right',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(entity.$id)}`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}
			}
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}