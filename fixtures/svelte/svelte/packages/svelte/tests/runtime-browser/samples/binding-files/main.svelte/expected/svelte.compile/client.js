import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";

var root = $.from_html(`<input type="file"/> <button>Reset</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let files;

	onMount(() => {
		let list = new DataTransfer();
		let file = new File(["content"], "filename.jpg");

		list.items.add(file);
		files = list.files;
	});

	var fragment = root();
	var input = $.first_child(fragment);
	var button = $.sibling(input, 2);

	$.bind_files(input, () => files, ($$value) => files = $$value);
	$.delegated('click', button, () => files = new DataTransfer().files);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);