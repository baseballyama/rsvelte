import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoDatePicker from '../DemoDatePicker.svelte';
import DemoDateInput from '../DemoDateInput.svelte';

var root = $.from_html(`<a id="Demo"></a> <h1>Demo</h1> <a id="DateInput"></a> <h2>DateInput</h2> <!> <a id="DatePicker"></a> <h2>DatePicker</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.head('1du1zi4', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Demo • Date Picker Svelte';
		});
	});

	var node = $.sibling($.first_child(fragment), 8);

	DemoDateInput(node, {});

	var node_1 = $.sibling(node, 6);

	DemoDatePicker(node_1, {});
	$.append($$anchor, fragment);
}