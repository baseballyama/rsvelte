import * as $ from 'svelte/internal/server';
import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';

export default function ActionBar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selectedItem, actions: barActions, setSearchText } = $$props;

		const actions = $.derived(() => {
			if (!selectedItem) return [];

			if (selectedItem.type === 'calculator') {
				return [
					{ title: 'Copy Answer', handler: barActions.handleEnter },
					{
						title: 'Put Answer in Search Bar',
						shortcut: { key: 'enter', modifiers: ['ctrl', 'shift'] },
						handler: () => setSearchText(selectedItem.data.result)
					}
				];
			}

			if (selectedItem.type === 'plugin') {
				return [
					{ title: 'Open Command', handler: barActions.handleEnter },
					{
						title: 'Reset Ranking',
						handler: barActions.handleResetRanking
					},

					{
						title: 'Copy Deeplink',
						shortcut: { key: 'c', modifiers: ['ctrl', 'shift'] },
						handler: barActions.handleCopyDeeplink
					},

					{
						title: 'Configure Command',
						shortcut: { key: ',', modifiers: ['ctrl', 'shift'] },
						handler: barActions.handleConfigureCommand
					}
				];
			}

			if (selectedItem.type === 'app') {
				return [
					{ title: 'Open Application', handler: barActions.handleEnter },
					{
						title: 'Reset Ranking',
						handler: barActions.handleResetRanking
					},

					{
						title: 'Copy Name',
						shortcut: { key: '.', modifiers: ['ctrl'] },
						handler: barActions.handleCopyAppName
					},

					{
						title: 'Copy Path',
						shortcut: { key: '.', modifiers: ['ctrl', 'shift'] },
						handler: barActions.handleCopyAppPath
					},

					{
						title: 'Hide Application',
						shortcut: { key: 'h', modifiers: ['ctrl'] },
						handler: barActions.handleHideApp
					}
				];
			}

			if (selectedItem.type === 'quicklink') {
				return [{ title: 'Open Quicklink', handler: barActions.handleEnter }];
			}

			return [];
		});

		if (selectedItem) {
			$$renderer.push('<!--[0-->');
			ActionBar($$renderer, { actions: actions() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}