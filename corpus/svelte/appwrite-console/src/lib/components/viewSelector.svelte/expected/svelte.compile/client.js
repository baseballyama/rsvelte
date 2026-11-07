import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { View } from '$lib/helpers/load';
import { Icon, Button } from '@appwrite.io/pink-svelte';
import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
import ViewToggle from './viewToggle.svelte';
import ColumnSelector from './columnSelector.svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { preferences } from '$lib/stores/preferences';
import { page } from '$app/state';
import { hash } from '$lib/helpers/string';

var root = $.from_html(`<!> <!>`, 1);

export default function ViewSelector($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let onlyIcon = $.prop($$props, 'onlyIcon', 3, false),
		ui = $.prop($$props, 'ui', 3, 'legacy'),
		view = $.prop($$props, 'view', 15),
		isCustomTable = $.prop($$props, 'isCustomTable', 3, false),
		hideView = $.prop($$props, 'hideView', 3, false),
		hideColumns = $.prop($$props, 'hideColumns', 3, false),
		allowNoColumns = $.prop($$props, 'allowNoColumns', 3, false),
		showAnyway = $.prop($$props, 'showAnyway', 3, false),
		disableButton = $.prop($$props, 'disableButton', 3, false),
		onCustomOptionClick = $.prop($$props, 'onCustomOptionClick', 3, null),
		onPreferencesUpdated = $.prop($$props, 'onPreferencesUpdated', 3, null);

	let showCountBadge = $.state(false);
	const preferenceKey = $.derived(getPreferenceKey);

	function getPreferenceKey() {
		const tableId = page.params.table;
		const organizationId = page.data.organization?.$id ?? page.data.project?.teamId;

		return hash([organizationId, tableId].filter(Boolean).join('#'));
	}

	function updateBadgeState() {
		if (!preferences.getKey($.get(preferenceKey), false)) {
			$.set(showCountBadge, true);
			preferences.setKey($.get(preferenceKey), true);
		}
	}

	function handlePreferencesUpdated() {
		updateBadgeState();
		onPreferencesUpdated()?.();
	}

	$.user_effect(() => {
		$.set(showCountBadge, !onlyIcon() || !!preferences.getKey($.get(preferenceKey), false), true);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				const children = ($$anchor, toggle = $.noop, selectedColumnsNumber = $.noop) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => !$columns().length && showAnyway() || disableButton());
						let $1 = $.derived(() => onlyIcon() && !$isSmallViewport() ? 'width-fix' : undefined);
						let $2 = $.derived(() => $.get(showCountBadge) ? selectedColumnsNumber().toString() : undefined);

						$.component(node_1, () => Button.Button, ($$anchor, Button_Button) => {
							Button_Button($$anchor, {
								size: 's',
								get icon() {
									return onlyIcon();
								},

								get onclick() {
									return toggle();
								},
								variant: 'secondary',
								get disabled() {
									return $.get($0);
								},

								get class() {
									return $.get($1);
								},

								get badge() {
									return $.get($2);
								},

								$$slots: {
									start: ($$anchor, $$slotProps) => {
										Icon($$anchor, {
											slot: 'start',
											get icon() {
												return IconViewBoards;
											}
										});
									}
								}
							});
						});
					}

					$.append($$anchor, fragment_2);
				};

				ColumnSelector($$anchor, {
					get ui() {
						return ui();
					},

					get columns() {
						return $$props.columns;
					},

					get showAnyway() {
						return showAnyway();
					},

					get isCustomTable() {
						return isCustomTable();
					},

					get allowNoColumns() {
						return allowNoColumns();
					},

					get onCustomOptionClick() {
						return onCustomOptionClick();
					},
					onPreferencesUpdated: handlePreferencesUpdated,
					children,
					$$slots: { default: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if (!hideColumns() && view() === View.Table) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			ViewToggle($$anchor, {
				get view() {
					return view();
				},

				set view($$value) {
					view($$value);
				}
			});
		};

		$.if(node_2, ($$render) => {
			if (!hideView()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}