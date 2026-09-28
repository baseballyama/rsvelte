import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';

export default function ActionBar_1($$anchor, $$props) {
	$.push($$props, true);

	const actions = $.derived(() => {
		if (!$$props.selectedItem) return [];

		if ($$props.selectedItem.type === 'calculator') {
			return [
				{ title: 'Copy Answer', handler: $$props.actions.handleEnter },
				{
					title: 'Put Answer in Search Bar',
					shortcut: { key: 'enter', modifiers: ['ctrl', 'shift'] },
					handler: () => $$props.setSearchText($$props.selectedItem.data.result)
				}
			];
		}

		if ($$props.selectedItem.type === 'plugin') {
			return [
				{ title: 'Open Command', handler: $$props.actions.handleEnter },
				{
					title: 'Reset Ranking',
					handler: $$props.actions.handleResetRanking
				},

				{
					title: 'Copy Deeplink',
					shortcut: { key: 'c', modifiers: ['ctrl', 'shift'] },
					handler: $$props.actions.handleCopyDeeplink
				},

				{
					title: 'Configure Command',
					shortcut: { key: ',', modifiers: ['ctrl', 'shift'] },
					handler: $$props.actions.handleConfigureCommand
				}
			];
		}

		if ($$props.selectedItem.type === 'app') {
			return [
				{
					title: 'Open Application',
					handler: $$props.actions.handleEnter
				},

				{
					title: 'Reset Ranking',
					handler: $$props.actions.handleResetRanking
				},

				{
					title: 'Copy Name',
					shortcut: { key: '.', modifiers: ['ctrl'] },
					handler: $$props.actions.handleCopyAppName
				},

				{
					title: 'Copy Path',
					shortcut: { key: '.', modifiers: ['ctrl', 'shift'] },
					handler: $$props.actions.handleCopyAppPath
				},

				{
					title: 'Hide Application',
					shortcut: { key: 'h', modifiers: ['ctrl'] },
					handler: $$props.actions.handleHideApp
				}
			];
		}

		if ($$props.selectedItem.type === 'quicklink') {
			return [
				{
					title: 'Open Quicklink',
					handler: $$props.actions.handleEnter
				}
			];
		}

		return [];
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ActionBar($$anchor, {
				get actions() {
					return $.get(actions);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.selectedItem) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}