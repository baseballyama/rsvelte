import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>external</button> <!> <button>internal</button> <!>`, 1);

export default function Main($$anchor) {
	let visibleExternal = $.state(false);
	let external = $.state(1);

	const throws = $.derived(() => {
		$.set(external, 2);

		return $.get(external);
	});

	let visibleInternal = $.state(false);

	const works = $.derived(() => {
		let internal = $.state(1);

		$.set(internal, 2);

		return $.get(internal);
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
}

$.delegate(['click']);