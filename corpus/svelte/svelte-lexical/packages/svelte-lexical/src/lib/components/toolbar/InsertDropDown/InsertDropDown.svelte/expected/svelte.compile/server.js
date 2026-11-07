import * as $ from 'svelte/internal/server';
import { getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '../../generic/dropdown/DropDown.svelte';

export default function InsertDropDown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const isEditable = getIsEditable();

		DropDown($$renderer, {
			disabled: !$.store_get($$store_subs ??= {}, '$isEditable', isEditable),
			buttonClassName: 'toolbar-item spaced',
			buttonLabel: 'Insert',
			buttonAriaLabel: 'Insert specialized editor node',
			buttonIconClassName: 'icon plus',
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}