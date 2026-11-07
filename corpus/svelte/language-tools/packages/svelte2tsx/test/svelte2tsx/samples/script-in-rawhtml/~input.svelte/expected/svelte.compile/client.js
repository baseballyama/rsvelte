import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const schema = { key: "value" };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
	$.append($$anchor, fragment);
}