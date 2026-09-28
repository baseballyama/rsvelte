import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<!> <div class="foo svelte-1nvcr6w">foo</div>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Nested(node, {});
	$.next(2);
	$.append($$anchor, fragment);
}