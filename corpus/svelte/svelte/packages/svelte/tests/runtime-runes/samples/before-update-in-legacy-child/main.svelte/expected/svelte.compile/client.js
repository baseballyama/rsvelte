import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let object = $.proxy({ count: 0 });
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var node = $.sibling(button, 2);

	Child(node, {
		get object() {
			return object;
		}
	});

	$.template_effect(() => $.set_text(text, `clicks: ${object.count ?? ''}`));
	$.delegated('click', button, () => object.count += 1);
	$.append($$anchor, fragment);
}

$.delegate(['click']);