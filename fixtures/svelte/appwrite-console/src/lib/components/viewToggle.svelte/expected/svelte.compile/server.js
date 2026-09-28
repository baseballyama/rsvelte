import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { preferences } from '$lib/stores/preferences';
import { IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';
import { ToggleButton } from '@appwrite.io/pink-svelte';

export default function ViewToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { view = void 0 } = $$props;

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

		$.css_props(
			$$renderer,
			true,
			{
				'--bgcolor-neutral-default': 'var(--bgcolor-neutral-primary)'
			},
			() => {
				ToggleButton($$renderer, {
					active: view,
					buttons: [
						{ id: 'table', label: 'table view', icon: IconViewList },
						{ id: 'grid', label: 'grid view', icon: IconViewGrid }
					]
				});
			}
		);

		$.bind_props($$props, { view });
	});
}