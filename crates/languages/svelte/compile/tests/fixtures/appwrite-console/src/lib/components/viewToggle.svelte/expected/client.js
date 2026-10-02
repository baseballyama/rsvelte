import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { preferences } from '$lib/stores/preferences';
import { IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';
import { ToggleButton } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function ViewToggle($$anchor, $$props) {
	$.push($$props, true);

	function onViewChange(event) {
		updateViewPreferences(event.detail);
		goto(getViewLink(event.detail), { replaceState: true });
	}

	function getViewLink(view) {
		const url = new URL(page.url);

		url.searchParams.set('view', view);

		return url.toString();
	}

	function updateViewPreferences(view) {
		preferences.setView(view);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [
			{ id: 'table', label: 'table view', icon: IconViewList },
			{ id: 'grid', label: 'grid view', icon: IconViewGrid }
		]);

		$.css_props(node, () => ({
			'--bgcolor-neutral-default': 'var(--bgcolor-neutral-primary)'
		}));

		ToggleButton(node.lastChild, {
			get active() {
				return $$props.view;
			},

			get buttons() {
				return $.get($0);
			},
			$$events: { change: onViewChange }
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
	$.pop();
}