import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Comp($$anchor, $$props) {
	const snippetProps = $.derived(() => ({ id: '123', name: 'my-select' }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => ({ props: $.get(snippetProps) }));
	$.append($$anchor, fragment);
}