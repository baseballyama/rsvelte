import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';
import { global } from './state.svelte.js';

var root = $.from_html(`<!> <button> </button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	global.value.count = 0;

	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get a() {
			return global.value;
		},

		set a($$value) {
			global.value = $$value;
		}
	});

	var button = $.sibling(node, 2);
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${global.value.count ?? ''}`));
	$.delegated('click', button, () => global.value.count++);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);