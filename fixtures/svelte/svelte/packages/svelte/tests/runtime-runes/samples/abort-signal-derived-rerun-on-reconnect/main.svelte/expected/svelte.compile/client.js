import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from 'svelte';

var root = $.from_html(`<button> </button> <button>toggle</button> <button>resolve</button> <div><!></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(true);
	let count = $.state(0);
	let queued = [];

	function sleep(value, signal) {
		return new Promise((resolve, reject) => {
			signal.addEventListener('abort', reject, { once: true });
			queued.push(() => resolve(value));
		});
	}

	const double = $.derived(() => sleep($.get(count) * 2, getAbortSignal()));
	var $$exports = { sleep };
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var div = $.sibling(button_2, 2);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.await(
				node_1,
				() => $.get(double),
				($$anchor) => {
					var text_3 = $.text('loading');

					$.append($$anchor, text_3);
				},
				($$anchor, value) => {
					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $.get(value)));
					$.append($$anchor, text_1);
				},
				($$anchor) => {
					var text_2 = $.text('error');

					$.append($$anchor, text_2);
				}
			);

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.delegated('click', button_1, () => $.set(show, !$.get(show)));
	$.delegated('click', button_2, () => queued.shift()?.());
	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);