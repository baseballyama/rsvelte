import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { settingsCore } from '$lib/state/generator.svelte';

var root = $.from_html(`<div class="p-5"><div class="field-group grid-cols-[auto_1fr]"><label class="label label-text preset-tonal" for="theme-name">Name</label> <input class="input" type="text" id="theme-name" placeholder="Enter theme name..."/></div></div>`);

export default function ControlsCore($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var input = $.sibling($.child(div_1), 2);

	$.remove_input_defaults(input);
	$.reset(div_1);
	$.reset(div);
	$.bind_value(input, () => settingsCore.name, ($$value) => settingsCore.name = $$value);
	$.append($$anchor, div);
	$.pop();
}