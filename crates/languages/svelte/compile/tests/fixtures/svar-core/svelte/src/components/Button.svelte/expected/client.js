import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<i></i>`);
var root_1 = $.from_html(`<button><!> <!></button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, ""),
		css = $.prop($$props, 'css', 3, ""),
		icon = $.prop($$props, 'icon', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		title = $.prop($$props, 'title', 3, ""),
		text = $.prop($$props, 'text', 3, "");

	let buttonCss = $.derived(() => {
		let cssType = type()
			? type().split(" ").filter((a) => a !== "").map((x) => "wx-" + x).join(" ")
			: "";

		return css() + (css() ? " " : "") + cssType;
	});

	const handleClick = (ev) => {
		$$props.onclick && $$props.onclick(ev);
	};

	var button = root_1();
	let classes;
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var i = root();

			$.template_effect(() => $.set_class(i, 1, $.clsx(icon()), 'svelte-1s0tks0'));
			$.append($$anchor, i);
		};

		$.if(node, ($$render) => {
			if (icon()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, text()));
			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'title', title());
		classes = $.set_class(button, 1, `wx-button ${$.get(buttonCss)}`, 'svelte-1s0tks0', classes, { 'wx-icon': icon() && !$$props.children });
		button.disabled = disabled();
		$.set_attribute(button, 'data-tooltip-text', $$props.tooltip);
	});

	$.delegated('click', button, handleClick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);