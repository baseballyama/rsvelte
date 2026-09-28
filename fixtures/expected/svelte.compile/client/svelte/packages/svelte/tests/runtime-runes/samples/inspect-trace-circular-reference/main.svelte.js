import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const filesState = $.proxy({ files: {} });
	let nodes = { id: 1, items: [{ id: 2, items: [{ id: 3 }, { id: 4 }] }] };

	filesState.files = nodes;

	function test() {
		filesState.files.items[0].parent = filesState.files;
	}

	$.user_effect(test);
	$.pop();
}