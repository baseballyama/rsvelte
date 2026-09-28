import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Parent($$anchor, $$props) {
	const tasks = ["do laundry", "do taxes", "cook food", "watch the kids"];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(
		node,
		$$props,
		'default',
		{
			get tasks() {
				return tasks;
			}
		},
		null
	);

	$.append($$anchor, fragment);
}