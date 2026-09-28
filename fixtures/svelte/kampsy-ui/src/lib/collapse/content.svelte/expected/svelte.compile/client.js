import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { slide } from "svelte/transition";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<p><!></p>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Content($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let { size, value } = getContext("collapseItem");
	let collapseItem = getContext("collapse");
	let isActive = $.state(false);
	const textObj = { small: "text-sm", large: "text-base" };

	let textClass = $.derived(() => {
		return textObj[size];
	});

	$.user_pre_effect(() => {
		if (collapseItem.getItem().includes(value)) {
			$.set(isActive, true);
		} else {
			$.set(isActive, false);
		}
	});

	let content = $.state(void 0);

	$.user_effect(() => {
		if ($.get(content)) {
			if ($.get(isActive)) {
				$.get(content).setAttribute("aria-hidden", "false");
			} else {
				$.get(content).setAttribute("aria-hidden", "true");
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, () => ({ class: 'pb-4', ...rest }));

			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var node_2 = $.child(p);

					$.snippet(node_2, () => $$props.children);
					$.reset(p);
					$.template_effect(() => $.set_class(p, 1, ` ${$.get(textClass) ?? ''} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 leading-6 font-normal`));
					$.append($$anchor, p);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(content, $$value), () => $.get(content));
			$.transition(3, div, () => slide);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(isActive)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}