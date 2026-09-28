import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Notice from "./Notice.svelte";

var root = $.from_html(`<div class="wx-notices svelte-2lhd9z"></div>`);

export default function Notices($$anchor, $$props) {
	let data = $.prop($$props, 'data', 19, () => []);
	var div = root();

	$.each(div, 21, data, (notice) => notice.id, ($$anchor, notice) => {
		Notice($$anchor, {
			get notice() {
				return $.get(notice);
			}
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}