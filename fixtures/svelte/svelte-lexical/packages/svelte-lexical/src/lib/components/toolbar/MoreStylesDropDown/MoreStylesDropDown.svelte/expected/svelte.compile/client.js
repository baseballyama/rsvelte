import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getIsEditable } from '$lib/core/composerContext.js';
import DropDown from '$lib/components/generic/dropdown/DropDown.svelte';

export default function MoreStylesDropDown($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const isEditable = getIsEditable();

	{
		let $0 = $.derived(() => !$isEditable());

		DropDown($$anchor, {
			get disabled() {
				return $.get($0);
			},
			buttonClassName: 'toolbar-item spaced',
			buttonLabel: '',
			buttonAriaLabel: 'Formatting options for additional text styles',
			buttonIconClassName: 'icon dropdown-more',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}