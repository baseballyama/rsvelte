import * as $ from 'svelte/internal/server';
import { observe } from '@threlte/core';
import { onDestroy } from 'svelte';
import { useSheet } from '../useSheet.js';

export default function Declare($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { props, children } = $$props;
		const { sheetObject, addProps, removeProps } = useSheet();
		let values = $.store_get($$store_subs ??= {}, '$sheetObject', sheetObject)?.value;

		addProps(props);

		onDestroy(() => {
			removeProps(Object.keys(props));
		});

		observe.pre(() => [sheetObject], ([sheetObject]) => {
			return sheetObject?.onValuesChange((v) => {
				values = v;
			});
		});

		children?.($$renderer, { values });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}