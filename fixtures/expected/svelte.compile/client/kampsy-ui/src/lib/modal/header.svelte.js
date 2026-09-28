import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<header aria-labelledby="modal-title"><!></header>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const rootState = getContext("modal");

	let headerClass = $.derived(() => {
		if (rootState.sticky) {
			return `absolute inset-x-0 top-0  w-full px-[24px] py-[20px]  bg-kui-light-bg-secondary dark:bg-kui-dark-bg
			rounded-t-[12px] border-b border-kui-light-gray-200 dark:border-kui-dark-gray-200 drop-shadow-xs`;
		} else {
			return "mb-6";
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var header = root();
			var node_1 = $.child(header);

			$.snippet(node_1, () => $$props.children);
			$.reset(header);
			$.template_effect(() => $.set_class(header, 1, $.clsx($.get(headerClass))));
			$.append($$anchor, header);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}