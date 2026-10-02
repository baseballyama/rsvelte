import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { observe } from '@threlte/core';
import { onDestroy } from 'svelte';
import { useSheet } from '../useSheet.js';

export default function Declare($$anchor, $$props) {
	$.push($$props, true);

	const $sheetObject = () => $.store_get(sheetObject, '$sheetObject', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { sheetObject, addProps, removeProps } = useSheet();
	let values = $.state($.proxy($sheetObject()?.value));

	addProps($$props.props);

	onDestroy(() => {
		removeProps(Object.keys($$props.props));
	});

	observe.pre(() => [sheetObject], ([sheetObject]) => {
		return sheetObject?.onValuesChange((v) => {
			$.set(values, v, true);
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ values: $.get(values) }));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}