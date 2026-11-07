import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';
import '../hljs.css';
import Nav from './_site-components/Nav.svelte';

var root = $.from_html(`<!> <main><!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	Nav(node, {
		get sections() {
			return $$props.data.sections;
		}
	});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}