import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteURLSearchParams } from 'svelte/reactivity';

var root = $.from_html(`<button>external</button> <!> <button>internal</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let visibleExternal = $.state(false);
	let external = new SvelteURLSearchParams();

	const throws = $.derived(() => {
		external.append('foo', 'bar');

		return external;
	});

	let visibleInternal = $.state(false);

	const works = $.derived(() => {
		let internal = new SvelteURLSearchParams();

		internal.append('foo', 'bar');

		return internal;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(throws)));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(visibleExternal)) $$render(consequent);
		});
	}

	var button_1 = $.sibling(node, 2);
	var node_1 = $.sibling(button_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(works)));
			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(visibleInternal)) $$render(consequent_1);
		});
	}

	$.delegated('click', button, () => $.set(visibleExternal, true));
	$.delegated('click', button_1, () => $.set(visibleInternal, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);