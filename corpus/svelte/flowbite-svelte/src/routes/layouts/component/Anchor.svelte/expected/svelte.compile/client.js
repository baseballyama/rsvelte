import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { twMerge } from "tailwind-merge";

const getText = (node) => {
	const text = [...node.childNodes].find((child) => child.nodeType === Node.TEXT_NODE);

	return text && text.textContent?.trim() || "";
};

export function extract(x) {
	if (x.firstElementChild) return {
		rel: x.tagName,
		href: "#" + x.firstElementChild?.id,
		name: getText(x)
	};

	return { name: "" };
}

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'tag',
	'class'
]);

var root = $.from_html(`<!> <span class="absolute -top-[140px]"></span> <a class="text-primary-700 dark:text-primary-700 ms-2 opacity-0 transition-opacity group-hover:opacity-100">#</a>`, 1);

export default function Anchor($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let content = $.state("");
	let slug = $.state("");

	function init(node) {
		$.set(content, getText(node), true);
		$.set(slug, $.get(content).replace(/\s/g, "-").toLocaleLowerCase(), true);
	}

	let elemClass = $.derived(() => twMerge("relative group", $$props.class));
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.element(node_1, () => $$props.tag, false, ($$element, $$anchor) => {
		$.action($$element, ($$node) => init?.($$node));
		$.attribute_effect($$element, () => ({ ...restProps, class: $.get(elemClass) }));

		var fragment_1 = root();
		var node_2 = $.first_child(fragment_1);

		$.snippet(node_2, () => $$props.children);

		var span = $.sibling(node_2, 2);
		var a = $.sibling(span, 2);

		$.template_effect(() => {
			$.set_attribute(span, 'id', $.get(slug));
			$.set_attribute(a, 'href', `#${$.get(slug) ?? ''}`);
			$.set_attribute(a, 'aria-label', `Link to this section: ${$.get(content) ?? ''}`);
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}