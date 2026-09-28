import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';

var root = $.from_html(`<p data-testid="order"> </p>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {string[]} */
	const order = $.proxy([]);

	/** @type {import('./$types').Snapshot<void>} */
	const snapshot = {
		capture: () => {},
		restore: () => {
			order.push('restore');
		}
	};

	afterNavigate(() => {
		order.push('afterNavigate');
	});

	var $$exports = { snapshot };
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => order.join(',')]);
	$.append($$anchor, p);

	return $.pop($$exports);
}