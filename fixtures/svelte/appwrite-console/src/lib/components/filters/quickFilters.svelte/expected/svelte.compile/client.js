import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomFilters } from '$lib/components/filters';
import { addFilterAndApply } from './quickFilters';
import { parsedTags } from './setFilters';
import Menu from '../menu/menu.svelte';
import { Button } from '$lib/elements/forms';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconFilterLine } from '@appwrite.io/pink-icons-svelte';
import QuickfiltersSubMenu from './quickfiltersSubMenu.svelte';

var root = $.from_html(`<span class="text">Filters</span>`);

export default function QuickFilters($$anchor, $$props) {
	$.push($$props, true);

	const $parsedTags = () => $.store_get(parsedTags, '$parsedTags', $$stores);
	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let buttonVariant = $.prop($$props, 'buttonVariant', 3, 'ghost');

	Menu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => $parsedTags()?.length ? `${$parsedTags().length}` : undefined);

						Button($$anchor, {
							ariaLabel: 'Filters',
							secondary: true,
							size: 's',
							get badge() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var span = root();

								$.append($$anchor, span);
							},

							$$slots: {
								default: true,
								start: ($$anchor, $$slotProps) => {
									Icon($$anchor, {
										get icon() {
											return IconFilterLine;
										},
										size: 's',
										slot: 'start'
									});
								}
							}
						});
					}
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => $parsedTags()?.length ? `${$parsedTags().length}` : undefined);

						Button($$anchor, {
							ariaLabel: 'Filters',
							text: true,
							icon: true,
							size: 's',
							get badge() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									get icon() {
										return IconFilterLine;
									},
									size: 's'
								});
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node, ($$render) => {
					if (buttonVariant() === 'secondary') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			menu: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_1 = $.first_child(fragment_6);

				$.each(node_1, 17, () => $$props.filterCols.filter((f) => f?.options), (filter) => filter.title + filter.id, ($$anchor, filter) => {
					var fragment_7 = $.comment();
					var node_2 = $.first_child(fragment_7);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => $.get(filter)?.array ? 'checkbox' : 'radio');

								QuickfiltersSubMenu($$anchor, {
									get filter() {
										return $.get(filter);
									},

									get variant() {
										return $.get($0);
									},

									$$events: {
										add: (e) => {
											addFilterAndApply(
												$.get(filter).id,
												$.get(filter).title,
												$.get(filter).operator,
												e.detail.value,
												$.get(filter)?.array
													? $.get(filter).options.filter((opt) => opt.checked).map((opt) => opt.value) ?? []
													: [],
												$columns(),
												$$props.analyticsSource
											);
										},

										clear: () => {
											addFilterAndApply($.get(filter).id, $.get(filter).title, $.get(filter).operator, null, [], $columns(), $$props.analyticsSource);
										}
									}
								});
							}
						};

						$.if(node_2, ($$render) => {
							if ($.get(filter).options) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_7);
				});

				$.append($$anchor, fragment_6);
			},

			end: ($$anchor, $$slotProps) => {
				CustomFilters($$anchor, {
					get columns() {
						return $$props.columns;
					}
				});
			}
		}
	});

	$.pop();
	$$cleanup();
}