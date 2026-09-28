import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import deepEqual from 'deep-equal';
import { onDestroy, onMount } from 'svelte';
import ColumnItem from '../columns/columnItem.svelte';

var root = $.from_html(`<div><!></div>`);

export default function Edit($$anchor, $$props) {
	$.push($$props, true);

	let row = $.prop($$props, 'row', 15, null),
		onChange = $.prop($$props, 'onChange', 3, null),
		onRevert = $.prop($$props, 'onRevert', 3, null),
		noInlineEdit = $.prop($$props, 'noInlineEdit', 3, false),
		openSideSheet = $.prop($$props, 'openSideSheet', 3, null),
		onRowStructureUpdate = $.prop($$props, 'onRowStructureUpdate', 3, null);

	let original;
	let wrapperEl;

	onMount(() => {
		original = structuredClone(row());

		if (noInlineEdit()) {
			openSideSheet()?.();

			return;
		}

		const trigger = wrapperEl.querySelector('button.input');

		if (trigger) {
			trigger.click();
		}
	});

	/**
	 * fire on `onDestroy` because at this point,
	 * the cell editor slot fragment is closed and enter was hit!
	 */
	onDestroy(async () => {
		const hasChanged = !deepEqual(original, row());

		if (hasChanged && onRowStructureUpdate()) {
			const accepted = await onRowStructureUpdate()(row());

			if (!accepted) {
				row(original);
				onRevert()?.(original);
			}
		}
	});

	$.user_effect(() => {
		if (!deepEqual(original, row())) {
			onChange()?.(row());
		}
	});

	var div = root();

	$.set_style(div, '', {}, { width: '100%' });

	var node = $.child(div);

	ColumnItem(node, {
		get column() {
			return $$props.column;
		},
		editing: true,
		fromSpreadsheet: true,
		label: undefined,
		get formValues() {
			return row();
		},

		set formValues($$value) {
			row($$value);
		},
		$$events: { click: () => openSideSheet()?.() }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => wrapperEl = $$value, () => wrapperEl);
	$.append($$anchor, div);
	$.pop();
}