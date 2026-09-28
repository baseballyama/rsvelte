import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

var root = $.from_html(`<!> <div class="input-row"><label>Depth <input type="number" class="svelte-zc9h5c"/></label> <label>Entries <input type="number" class="svelte-zc9h5c"/></label></div>`, 1);

export default function PreviewSettings($$anchor, $$props) {
	$.push($$props, true);

	let props = $.proxy({ previewDepth: 1, previewEntries: 3 });
	var fragment = root();
	var node = $.first_child(fragment);

	Inspect(node, $.spread_props(() => props, {
		class: 'not-content mt',
		get theme() {
			return globalOpts.theme;
		},

		get borderless() {
			return globalOpts.borderless;
		},

		get values() {
			return values;
		},
		showPreview: true,
		expandLevel: 0
	}));

	var div = $.sibling(node, 2);
	var label = $.child(div);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1));

	$.remove_input_defaults(input_1);
	$.reset(label_1);
	$.reset(div);
	$.bind_value(input, () => props.previewDepth, ($$value) => props.previewDepth = $$value);
	$.bind_value(input_1, () => props.previewEntries, ($$value) => props.previewEntries = $$value);
	$.append($$anchor, fragment);
	$.pop();
}