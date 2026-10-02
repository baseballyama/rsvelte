import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../../ui/index.js';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<div class="ImageFieldOptions svelte-cllbyb"><div class="option-group svelte-cllbyb"><!></div> <div class="option-group svelte-cllbyb"><!></div></div>`);

export default function ImageFieldOptions($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	// Use default values from field.config or fallback to defaults
	const max_size_mb = $.derived(() => $$props.field.config?.maxSizeMB ?? 1);

	const max_width_or_height = $.derived(() => $$props.field.config?.maxWidthOrHeight ?? 1920);

	function update_config(updates) {
		const next = { ...$$props.field.config || {}, ...updates };

		dispatch('input', { config: next });
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => UI.TextInput, ($$anchor, UI_TextInput) => {
		UI_TextInput($$anchor, {
			type: 'number',
			label: 'Max Size (MB)',
			get value() {
				return $.get(max_size_mb);
			},
			oninput: (value) => update_config({ maxSizeMB: Number(value) })
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.component(node_1, () => UI.TextInput, ($$anchor, UI_TextInput_1) => {
		UI_TextInput_1($$anchor, {
			type: 'number',
			label: 'Max Dimension (px)',
			get value() {
				return $.get(max_width_or_height);
			},
			oninput: (value) => update_config({ maxWidthOrHeight: Number(value) })
		});
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}