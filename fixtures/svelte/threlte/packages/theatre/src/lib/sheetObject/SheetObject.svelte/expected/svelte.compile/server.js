import * as $ from 'svelte/internal/server';
import { useStudio } from '../studio/useStudio.js';
import { currentWritable, useThrelte, observe } from '@threlte/core';
import { getContext, onDestroy, onMount } from 'svelte';
import Declare from './declare/Declare.svelte';
import Sync from './sync/Sync.svelte';
import Transform from './transform/Transform.svelte';
import { createSheetContext } from './useSheet.js';

export default function SheetObject($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			key,
			detach = false,
			props,
			selected = false,
			onchange,
			children
		} = $$props;

		const { invalidate } = useThrelte();
		let aggregatedProps = { ...props };
		const { sheet } = getContext('theatre-sheet');
		const sheetObject = currentWritable(sheet.object(key, aggregatedProps, { reconfigure: true }));

		onMount(() => {
			// Because the sheet object value subscription is not running before any
			// values change, we're emitting the initial value here. Doing this in
			// onMount also means that child components which might add props to the
			// sheet object have already been mounted.
			onchange?.(sheetObject.current.value);
		});

		// This flag is used to prevent the sheet object from being created after it
		// has been detached.
		let detached = false;

		onDestroy(() => {
			if (detach) {
				detached = true;
				sheet.detachObject(key);
			}
		});

		const updateSheetObject = () => {
			// if the sheetObject has already been detached, do nothing.
			if (detached) return;

			// first, detach the sheet object.
			sheet.detachObject(key);

			// create or reconfigure a sheet object here.
			sheetObject.set(sheet.object(key, aggregatedProps, { reconfigure: true }));
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
				if (detach) {
					sheet.detachObject(key);
				}
			} else {
				// update sheet object (reconfigure)
				updateSheetObject();
			}
		};

		createSheetContext({ sheetObject, addProps, removeProps });

		let values = $.store_get($$store_subs ??= {}, '$sheetObject', sheetObject)?.value;

		observe.pre(() => [sheetObject], ([sheetObject]) => {
			return sheetObject.onValuesChange((newValues) => {
				onchange?.(newValues);
				values = newValues;

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
				selected = selection.includes(sheetObject);
			});
		});

		// Provide a select function to select this sheet object in the Theatre.js
		// studio.
		const select = () => {
			$.store_get($$store_subs ??= {}, '$studio', studio)?.setSelection([sheetObject.current]);
		};

		const deselect = () => {
			if ($.store_get($$store_subs ??= {}, '$studio', studio)?.selection.includes(sheetObject.current)) {
				$.store_get($$store_subs ??= {}, '$studio', studio)?.setSelection([]);
			}
		};

		children?.($$renderer, {
			values,
			selected,
			select,
			deselect,
			sheetObject: $.store_get($$store_subs ??= {}, '$sheetObject', sheetObject),
			Sync,
			Transform,
			Declare
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { selected });
	});
}