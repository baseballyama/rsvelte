import * as $ from 'svelte/internal/server';
import { View } from '$lib/helpers/load';
import { Icon, Button } from '@appwrite.io/pink-svelte';
import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
import ViewToggle from './viewToggle.svelte';
import ColumnSelector from './columnSelector.svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { preferences } from '$lib/stores/preferences';
import { page } from '$app/state';
import { hash } from '$lib/helpers/string';

export default function ViewSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			onlyIcon = false,
			ui = 'legacy',
			columns,
			view = void 0,
			isCustomTable = false,
			hideView = false,
			hideColumns = false,
			allowNoColumns = false,
			showAnyway = false,
			disableButton = false,
			onCustomOptionClick = null,
			onPreferencesUpdated = null
		} = $$props;

		let showCountBadge = false;
		const preferenceKey = $.derived(getPreferenceKey);

		function getPreferenceKey() {
			const tableId = page.params.table;
			const organizationId = page.data.organization?.$id ?? page.data.project?.teamId;

			return hash([organizationId, tableId].filter(Boolean).join('#'));
		}

		function updateBadgeState() {
			if (!preferences.getKey(preferenceKey(), false)) {
				showCountBadge = true;
				preferences.setKey(preferenceKey(), true);
			}
		}

		function handlePreferencesUpdated() {
			updateBadgeState();
			onPreferencesUpdated?.();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (!hideColumns && view === View.Table) {
				$$renderer.push('<!--[0-->');

				{
					function children($$renderer, toggle, selectedColumnsNumber) {
						if (Button.Button) {
							$$renderer.push('<!--[-->');

							Button.Button($$renderer, {
								size: 's',
								icon: onlyIcon,
								onclick: toggle,
								variant: 'secondary',
								disabled: !$.store_get($$store_subs ??= {}, '$columns', columns).length && showAnyway || disableButton,
								class: onlyIcon && !$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'width-fix' : undefined,
								badge: showCountBadge ? selectedColumnsNumber.toString() : undefined,
								$$slots: {
									start: ($$renderer) => {
										Icon($$renderer, { slot: 'start', icon: IconViewBoards });
									}
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					ColumnSelector($$renderer, {
						ui,
						columns,
						showAnyway,
						isCustomTable,
						allowNoColumns,
						onCustomOptionClick,
						onPreferencesUpdated: handlePreferencesUpdated,
						children,
						$$slots: { default: true }
					});
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hideView) {
				$$renderer.push('<!--[0-->');

				ViewToggle($$renderer, {
					get view() {
						return view;
					},

					set view($$value) {
						view = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { view });
	});
}