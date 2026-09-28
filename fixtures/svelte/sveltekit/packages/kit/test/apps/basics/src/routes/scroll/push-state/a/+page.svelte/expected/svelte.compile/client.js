import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button id="back-button" type="button">Back</button>`);

export default function _page($$anchor) {
	var button = root();

	$.delegated('click', button, () => history.back());
	$.append($$anchor, button);
}

$.delegate(['click']);