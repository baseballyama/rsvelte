import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Task from "./Task.svelte";

var root = $.from_html(`<!> <button>Update prop</button>`, 1);

export default function Main($$anchor) {
	let task = $.state($.proxy({ text: "initial" }));
	var fragment = root();
	var node = $.first_child(fragment);

	Task(node, {
		get prop() {
			return $.get(task);
		}
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		$.set(task, { text: "updated" }, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);