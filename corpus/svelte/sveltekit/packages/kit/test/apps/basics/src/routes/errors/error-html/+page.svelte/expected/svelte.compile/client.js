import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Unexpected</button> <button>Expected</button> <button>Redirect</button>`, 1);

export default function _page($$anchor) {
	/** @param {string} type */
	async function fail(type) {
		await fetch(`/errors/error-html/make-root-fail?type=${type}`);

		if (type === 'redirect') {
			location.assign(location.href + '/404');
		} else {
			location.reload();
		}
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.delegated('click', button, () => fail('unexpected'));
	$.delegated('click', button_1, () => fail('expected'));
	$.delegated('click', button_2, () => fail('redirect'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);