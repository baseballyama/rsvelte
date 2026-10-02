import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function TextGradient($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, ""),
		variant = $.prop($$props, 'variant', 3, "mac");

	const ios = [
		"from-[#CF807F]",
		"via-[#EA6F7D]",
		"via-33%",
		"via-[#0D8EB4]",
		"via-66%",
		"to-[#0D4E4E]"
	];

	const ipad = [
		"from-[#339AAF]",
		"via-[#2E76DB]",
		"via-33%",
		"via-[#1B175F]",
		"via-66%",
		"to-[#6F57B4]"
	];

	const mac = [
		"from-[#021B8B]",
		"via-[#1E84D9]",
		"via-33%",
		"via-[#BD83A2]",
		"via-66%",
		"to-[#EF6F33]"
	];

	const watch = ["from-[#1AB7A1]", "via-[#3D2DA9]", "via-51%", "to-[#A53A9F]"];

	const vision = [
		"from-[#FF6148]",
		"via-[#E15C96]",
		"via-33%",
		"via-[#4153E0]",
		"via-66%",
		"to-[#7D7FEB]"
	];

	let utilities = $.derived(() => {
		switch (variant()) {
			case "ios":
				return `bg-linear-to-r ${ios.join(" ")} bg-clip-text text-transparent`;

			case "ipad":
				return `bg-linear-to-r ${ipad.join(" ")} bg-clip-text text-transparent`;

			case "mac":
				return `bg-linear-to-r ${mac.join(" ")} bg-clip-text text-transparent`;

			case "watch":
				return `bg-linear-to-r ${watch.join(" ")} bg-clip-text text-transparent`;

			case "vision":
				return `bg-linear-to-r ${vision.join(" ")} bg-clip-text text-transparent`;

			default:
				return `bg-linear-to-r ${mac.join(" ")} bg-clip-text text-transparent`;
		}
	});

	var div = root();
	var text_1 = $.only_child(div, true);

	$.template_effect(() => {
		$.set_class(div, 1, `${$.get(utilities) ?? ''} ${klass() ?? ''}`);
		$.set_text(text_1, $$props.text);
	});

	$.append($$anchor, div);
}