import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputTags } from '$lib/elements/forms';
import { symmetricDifference } from '$lib/helpers/array';
import { preferences } from '$lib/stores/preferences';
import { organization } from '$lib/stores/organization';

export default function DisplayName($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let onSuccess = $.prop($$props, 'onSuccess', 3, null),
		onFailure = $.prop($$props, 'onFailure', 3, null);

	let names = $.state($.proxy(getDisplayNames()));
	const isDisabled = $.derived(() => !symmetricDifference($.get(names), getDisplayNames()).length || $.get(names).length > 5);

	function getDisplayNames() {
		const displayNames = preferences.getDisplayNames($$props.collectionId, $$props.databaseType) ?? [];

		return displayNames.filter((name) => !name.startsWith('$'));
	}

	function hasChanged() {
		return $.get(isDisabled);
	}

	async function updateDisplayNames() {
		try {
			const regularArray = [...$.get(names)];

			await preferences.setDisplayNames($organization().$id, $$props.collectionId, regularArray, $$props.databaseType);
			await onSuccess()?.();

			// reset with new values!
			$.set(names, getDisplayNames(), true);
		} catch(error) {
			await onFailure()?.(error);
		}
	}

	$.user_effect(() => {
		$.set(names, getDisplayNames(), true);
	});

	var $$exports = { hasChanged, updateDisplayNames };

	InputTags($$anchor, {
		max: 5,
		required: true,
		get id() {
			return `custom-columns-${$$props.collectionId ?? ''}`;
		},
		placeholder: 'Enter fields',
		label: 'Fields to display',
		helper: 'ID, createdAt, and updatedAt are always included and cannot be modified',
		get tags() {
			return $.get(names);
		},

		set tags($$value) {
			$.set(names, $$value, true);
		}
	});

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}