import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from './Code.svelte';

var root = $.from_html(`<div class="svelte-3hti2i"><!></div> <!>`, 1);

export default function Example($$anchor, $$props) {
	let width = $.prop($$props, 'width', 3, '100%'),
		aspectRatio = $.prop($$props, 'aspectRatio', 3, '1'),
		files = $.prop($$props, 'files', 19, () => []);

	var fragment = root();
	var div = $.first_child(fragment);
	let styles;
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Code(node_1, {
		copy: true,
		get files() {
			return files();
		}
	});

	$.template_effect(() => styles = $.set_style(div, '', styles, { 'max-width': width(), 'aspect-ratio': aspectRatio() }));
	$.append($$anchor, fragment);
}