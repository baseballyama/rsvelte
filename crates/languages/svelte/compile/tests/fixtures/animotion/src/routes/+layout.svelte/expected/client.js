import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../styles/app.css';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('12qhfyh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Animotion';
		});
	});

	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
}