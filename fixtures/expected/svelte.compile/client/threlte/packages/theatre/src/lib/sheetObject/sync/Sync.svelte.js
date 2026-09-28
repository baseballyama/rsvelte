import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolvePropertyPath, useParent, observe } from '@threlte/core';
import { onDestroy } from 'svelte';
import { useStudio } from '../../studio/useStudio.js';
import { useSheet } from '../useSheet.js';
import { getInitialValue } from './utils/getInitialValue.js';
import { isComplexProp } from './utils/isComplexProp.js';
import { isStringProp } from './utils/isStringProp.js';
import { makeAlphanumeric } from './utils/makeAlphanumeric.js';
import { parsePropLabel } from './utils/parsePropLabel.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'type', 'children']);

export default function Sync($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $studio = () => $.store_get(studio, '$studio', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let rest = $.rest_props($$props, rest_excludes);
	const { sheetObject, addProps, removeProps } = useSheet();
	const parent = useParent();

	// serves as a map to map (custom) prop names to object target properties
	let propMappings = {};

	const initProps = () => {
		const props = {};

		// propertyPath is for example "position.x" or "intensity", so a property path on the parent object
		Object.entries(rest).forEach(([propertyPath, propertyValue]) => {
			// The prop might have a custom name, for example "intensity" might be mapped to "light-intensity"
			const customKey = isComplexProp(propertyValue)
				? propertyValue.key
				: isStringProp(propertyValue) ? propertyValue : undefined;

			const key = customKey ?? makeAlphanumeric(propertyPath);

			// get the initial value as well as the correct transformer for the property
			const { value, transformer } = getInitialValue(propertyPath, propertyValue, $parent());

			const label = parsePropLabel(key, propertyValue);

			// apply the label to the value
			value.label = label;

			// add the prop to the propMappings map
			propMappings[key] = { propertyPath, transformer };

			// add the prop to the props object
			props[key] = value;
		});

		// add the props to the parent IsheetObject
		addProps(props);
	};

	const updateProjectionMatrixKeys = [
		'fov',
		'near',
		'far',
		'zoom',
		'left',
		'right',
		'top',
		'bottom',
		'aspect'
	];

	observe.pre(() => [parent, sheetObject], ([parent, sheetObject]) => {
		if (!parent) return;

		return sheetObject?.onValuesChange((values) => {
			// Ensure that the parent is still mounted
			Object.keys(values).forEach((key) => {
				// first, check if the prop is mapped in this component
				const propMapping = propMappings[key];

				if (!propMapping) return;

				// we're using the addedProps map to infer the target property name from the property name on values
				const { target, key: targetKey } = resolvePropertyPath(parent, propMapping.propertyPath);

				// use a transformer to apply value
				const transformer = propMapping.transformer;

				transformer.apply(target, targetKey, values[key]);

				if (updateProjectionMatrixKeys.includes(targetKey)) {
					target.updateProjectionMatrix?.();
				}
			});
		});
	});

	initProps();

	const studio = useStudio();

	/**
	 * Capture the current values of the props
	 */
	const capture = () => {
		if (!$studio()) return;

		const scrub = $studio().scrub();

		Object.keys(sheetObject.current.value).forEach((key) => {
			// first, check if the prop is mapped in this component
			const propMapping = propMappings[key];

			if (!propMapping) return;

			// we're using the addedProps map to infer the target property name from the property name on values
			const { target, key: targetKey } = resolvePropertyPath($parent(), propMapping.propertyPath);

			const value = propMapping.transformer.transform(target[targetKey]).default;

			scrub.capture(({ set }) => {
				set(sheetObject.current.props[key], value);
			});
		});

		scrub.commit();
	};

	onDestroy(() => {
		removeProps(Object.keys(propMappings));
	});

	var $$exports = { capture };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ capture }));
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}