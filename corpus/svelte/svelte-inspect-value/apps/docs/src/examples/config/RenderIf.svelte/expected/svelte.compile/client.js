import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

var root = $.from_html(`<div class="cnt svelte-3txg68"><!></div> <div class="input-row"><label>Should Render <input type="checkbox"/></label></div>`, 1);

export default function RenderIf($$anchor, $$props) {
	$.push($$props, true);

	let shouldRender = $.state(true);
	let renderIf = () => $.get(shouldRender);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Inspect(node, {
		renderIf,
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
		expandLevel: 0
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var label = $.child(div_1);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);
	$.reset(div_1);
	$.bind_checked(input, () => $.get(shouldRender), ($$value) => $.set(shouldRender, $$value));
	$.append($$anchor, fragment);
	$.pop();
}