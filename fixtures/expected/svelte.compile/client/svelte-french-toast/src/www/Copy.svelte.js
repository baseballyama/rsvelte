import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import toast from '../lib';

var root = $.from_html(`<button type="button" class="text-sm mt-2 text-blue-600 font-medium space-x-1 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z"></path><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z"></path></svg> <span>Copy</span></button>`);

export default function Copy($$anchor, $$props) {
	$.push($$props, true);

	function copy(text) {
		const promise = navigator.clipboard.writeText(text);

		toast.promise(promise, {
			loading: 'Copying...',
			success: 'Copied!',
			error: 'Could not copy'
		});
	}

	var button = root();

	$.delegated('click', button, () => copy($$props.text));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);