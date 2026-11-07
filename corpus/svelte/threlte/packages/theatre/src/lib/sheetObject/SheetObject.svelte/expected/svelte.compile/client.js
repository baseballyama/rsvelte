import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStudio } from '../studio/useStudio.js';
import { currentWritable, useThrelte, observe } from '@threlte/core';
import { getContext, onDestroy, onMount } from 'svelte';
import Declare from './declare/Declare.svelte';
import Sync from './sync/Sync.svelte';
import Transform from './transform/Transform.svelte';
import { createSheetContext } from './useSheet.js';

export default function SheetObject($$anchor, $$props) {
	$.push($$props, true);

	const $sheetObject = () => $.store_get(sheetObject, '$sheetObject', $$stores);
	const $studio = () => $.store_get(studio, '$studio', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let detach = $.prop($$props, 'detach', 3, false),
		selected = $.prop($$props, 'selected', 15, false);

	const { invalidate } = useThrelte();
	let aggregatedProps = { ...$$props.props };
	const { sheet } = getContext('theatre-sheet');
	const sheetObject = currentWritable(sheet.object($$props.key, aggregatedProps, { reconfigure: true }));

	onMount(() => {
		// Because the sheet object value subscription is not running before any
		// values change, we're emitting the initial value here. Doing this in
		// onMount also means that child components which might add props to the
		// sheet object have already been mounted.
		$$props.onchange?.(sheetObject.current.value);
	});

	// This flag is used to prevent the sheet object from being created after it
	// has been detached.
	let detached = false;

	onDestroy(() => {
		if (detach()) {
			detached = true;
			sheet.detachObject($$props.key);
		}
	});

	const updateSheetObject = () => {
		// if the sheetObject has already been detached, do nothing.
		if (detached) return;

		// first, detach the sheet object.
		sheet.detachObject($$props.key);

		// create or reconfigure a sheet object here.
		sheetObject.set(sheet.object($$props.key, aggregatedProps, { reconfigure: true }));
	};

	const addProps = (props) => {
		// add props to list of props
		aggregatedProps = { ...aggregatedProps, ...props };

		// update sheet object (create or reconfigure)
		updateSheetObject();
	};

	const removeProps = (propNames) => {
		// remove props from sheet object
		propNames.forEach((prop) => {
			delete aggregatedProps[prop];
		});

		// if there are no more props, detach sheet object
		if (Object.keys(aggregatedProps).length === 0) {
			// detach sheet object
			if (detach()) {
				sheet.detachObject($$props.key);
			}
		} else {
			// update sheet object (reconfigure)
			updateSheetObject();
		}
	};

	createSheetContext({ sheetObject, addProps, removeProps });

	let values = $.state($.proxy($sheetObject()?.value));

	observe.pre(() => [sheetObject], ([sheetObject]) => {
		return sheetObject.onValuesChange((newValues) => {
			$$props.onchange?.(newValues);
			$.set(values, newValues, true);

			// this invalidation also invalidates changes catched by slotted
			// components such as <Sync> or <Declare>.
			invalidate();
		});
	});

	// Provide a flag to indicate whether this sheet object is selected in the
	// Theatre.js studio.
	const studio = useStudio();

	observe.pre(() => [studio, sheetObject], ([studio, sheetObject]) => {
		return studio?.onSelectionChange((selection) => {
			selected(selection.includes(sheetObject));
		});
	});

	// Provide a select function to select this sheet object in the Theatre.js
	// studio.
	const select = () => {
		$studio()?.setSelection([sheetObject.current]);
	};

	const deselect = () => {
		if ($studio()?.selection.includes(sheetObject.current)) {
			$studio()?.setSelection([]);
		}
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({
		values: $.get(values),
		selected: selected(),
		select,
		deselect,
		sheetObject: $sheetObject(),
		Sync,
		Transform,
		Declare
	}));

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}