import * as $ from 'svelte/internal/server';
import { InputTags } from '$lib/elements/forms';
import { symmetricDifference } from '$lib/helpers/array';
import { preferences } from '$lib/stores/preferences';
import { organization } from '$lib/stores/organization';

export default function DisplayName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			collectionId,
			databaseType,
			onSuccess = null,
			onFailure = null
		} = $$props;

		let names = getDisplayNames();
		const isDisabled = $.derived(() => !symmetricDifference(names, getDisplayNames()).length || names.length > 5);

		function getDisplayNames() {
			const displayNames = preferences.getDisplayNames(collectionId, databaseType) ?? [];

			return displayNames.filter((name) => !name.startsWith('$'));
		}

		function hasChanged() {
			return isDisabled();
		}

		async function updateDisplayNames() {
			try {
				const regularArray = [...names];

				await preferences.setDisplayNames($.store_get($$store_subs ??= {}, '$organization', organization).$id, collectionId, regularArray, databaseType);
				await onSuccess?.();

				// reset with new values!
				names = getDisplayNames();
			} catch(error) {
				await onFailure?.(error);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			InputTags($$renderer, {
				max: 5,
				required: true,
				id: `custom-columns-${$.stringify(collectionId)}`,
				placeholder: 'Enter fields',
				label: 'Fields to display',
				helper: 'ID, createdAt, and updatedAt are always included and cannot be modified',
				get tags() {
					return names;
				},

				set tags($$value) {
					names = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { hasChanged, updateDisplayNames });
	});
}