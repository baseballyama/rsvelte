import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dt></dt> <dd> </dd>`, 1);
var root_1 = $.from_html(`<h2>Fetch URLs</h2> <dl></dl> <h2>Fetch Responses</h2> <dl></dl> <h2>Fetch Redirects</h2> <dl></dl>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();

	var /** @type {import('./$types').PageProps} */
	dl = $.sibling($.first_child(fragment), 2);

	$.each(dl, 21, () => $$props.data.fetches, $.index, ($$anchor, item, index) => {
		var fragment_1 = root();
		var dt = $.first_child(fragment_1);

		dt.textContent = `fetch${index + 1}-url`;

		var dd = $.sibling(dt, 2);

		$.set_attribute(dd, 'data-testid', `fetch${index + 1}-url`);

		var text = $.only_child(dd, true);

		$.template_effect(() => $.set_text(text, $.get(item).url));
		$.append($$anchor, fragment_1);
	});

	$.reset(dl);

	var dl_1 = $.sibling(dl, 4);

	$.each(dl_1, 21, () => $$props.data.fetches, $.index, ($$anchor, item, index) => {
		var fragment_2 = root();
		var dt_1 = $.first_child(fragment_2);

		dt_1.textContent = `fetch${index + 1}-response`;

		var dd_1 = $.sibling(dt_1, 2);

		$.set_attribute(dd_1, 'data-testid', `fetch${index + 1}-response`);

		var text_1 = $.only_child(dd_1, true);

		$.template_effect(() => $.set_text(text_1, $.get(item).response));
		$.append($$anchor, fragment_2);
	});

	$.reset(dl_1);

	var dl_2 = $.sibling(dl_1, 4);

	$.each(dl_2, 21, () => $$props.data.fetches, $.index, ($$anchor, item, index) => {
		var fragment_3 = root();
		var dt_2 = $.first_child(fragment_3);

		dt_2.textContent = `fetch${index + 1}-redirect`;

		var dd_2 = $.sibling(dt_2, 2);

		$.set_attribute(dd_2, 'data-testid', `fetch${index + 1}-redirect`);

		var text_2 = $.only_child(dd_2, true);

		$.template_effect(() => $.set_text(text_2, $.get(item).redirect));
		$.append($$anchor, fragment_3);
	});

	$.reset(dl_2);
	$.append($$anchor, fragment);
	$.pop();
}