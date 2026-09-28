import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const { foo } = x();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => foo, $.index, ($$anchor, f) => {});
	$.append($$anchor, fragment);
}