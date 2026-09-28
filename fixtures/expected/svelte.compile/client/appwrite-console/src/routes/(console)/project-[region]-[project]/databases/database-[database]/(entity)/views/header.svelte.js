import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $expandTabs = () => $.store_get(expandTabs, '$expandTabs', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * `useTerminology` is needed because -
	 * 1. headers are initialized **before** content,
	 * 2. `getTerminologies` isn't available at that point.
	 */
	const terminology = useTerminology(page);

	const parentHref = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params));

	const basePath = $.derived(() => {
		const entityType = terminology.entity.lower.singular;

		return withPath(resolveRoute(`/(console)/project-[region]-[project]/databases/database-[database]`, page.params), `${entityType}-${$$props.entity.$id}`);
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

	$.user_effect(() => {
		if ($.get(nonSheetPages)) expandTabs.set(true); else {
			expandTabs.set(preferences.getKey('entityHeaderExpanded', true));
		}
	});

	var div = root();
	let classes;
	var node = $.child(div);

	{
		let $0 = $.derived(() => !$expandTabs());
		let $1 = $.derived(() => $expandTabs() ? '152px' : '90px');

		Cover(node, {
			animate: true,
			expanded: true,
			get collapsed() {
				return $.get($0);
			},

			get blocksize() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var div_1 = root();
				let classes_1;
				var node_1 = $.child(div_1);

				Tabs(node_1, {
					children: ($$anchor, $$slotProps) => {
						var fragment = $.comment();
						var node_2 = $.first_child(fragment);

						$.each(node_2, 17, () => $$props.tabs, $.index, ($$anchor, tab) => {
							{
								let $0 = $.derived(() => isTabSelected($.get(tab), page.url.pathname, $.get(basePath), $$props.tabs));

								Tab($$anchor, {
									get href() {
										return $.get(tab).href;
									},

									get selected() {
										return $.get($0);
									},

									get event() {
										return $.get(tab).event;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(tab).title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							}
						});

						$.append($$anchor, fragment);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.template_effect(() => classes_1 = $.set_class(div_1, 1, 'tabs-container svelte-19lt5mc', null, classes_1, { collapsed: !$expandTabs() }));
				$.append($$anchor, div_1);
			},

			$$slots: {
				default: true,
				header: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							direction: 'row',
							alignContent: 'center',
							alignItems: 'center',
							inline: true,
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_4 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => !$expandTabs());

									AnimatedTitle(node_4, {
										get href() {
											return $.get(parentHref);
										},

										get collapsed() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $$props.entity.name));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								}

								var node_5 = $.sibling(node_4, 2);

								$.key(node_5, () => $$props.entity.$id, ($$anchor) => {
									{
										let $0 = $.derived(() => $expandTabs() ? undefined : 'right');

										Id($$anchor, {
											get value() {
												return $$props.entity.$id;
											},

											get tooltipPlacement() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, $$props.entity.$id));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				}
			}
		});
	}

	$.reset(div);
	$.template_effect(() => classes = $.set_class(div, 1, 'svelte-19lt5mc', null, classes, { nonSheetPages: $.get(nonSheetPages) }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}