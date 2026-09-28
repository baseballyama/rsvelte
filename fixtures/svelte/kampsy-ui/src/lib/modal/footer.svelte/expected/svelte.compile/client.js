import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<footer aria-labelledby="modal-actions"><!></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	let klass = $.prop($$props, 'class', 3, "");
	const rootState = getContext("modal");

	let footerClass = $.derived(() => {
		if (rootState.sticky) {
			return ``;
		} else {
			return "";
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var footer = root();
			var node_1 = $.child(footer);

			$.snippet(node_1, () => $$props.children);
			$.reset(footer);

			$.template_effect(() => $.set_class(footer, 1, `border-kui-light-gray-200 dark:border-kui-dark-gray-200 bg-kui-light-bg-secondary dark:bg-kui-dark-bg sticky inset-x-0 bottom-0 box-border flex items-center
	justify-between rounded-b-xl border-t p-4 drop-shadow-xs lg:absolute ${$.get(footerClass) ?? ''} ${klass() ?? ''}`));

			$.append($$anchor, footer);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}