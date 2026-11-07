import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { spinner } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'color',
	'size',
	'class',
	'currentFill',
	'currentColor'
]);

var root = $.from_svg(`<svg><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"></path><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"></path></svg>`);
var root_1 = $.from_svg(`<svg><circle cx="15" cy="15" r="15"><animate attributeName="r" values="15;9;15" dur="0.8s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" values="1;.5;1" dur="0.8s" repeatCount="indefinite"></animate></circle><circle cx="60" cy="15" r="9" fill-opacity="0.3"><animate attributeName="r" values="9;15;9" dur="0.8s" begin="0.2s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" values=".5;1;.5" dur="0.8s" begin="0.2s" repeatCount="indefinite"></animate></circle><circle cx="105" cy="15" r="15"><animate attributeName="r" values="15;9;15" dur="0.8s" begin="0.4s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" values="1;.5;1" dur="0.8s" begin="0.4s" repeatCount="indefinite"></animate></circle></svg>`);
var root_2 = $.from_svg(`<svg><rect y="10" width="15" height="120" rx="6"><animate attributeName="height" values="120;60;120" dur="1.2s" repeatCount="indefinite"></animate><animate attributeName="y" values="10;40;10" dur="1.2s" repeatCount="indefinite"></animate></rect><rect x="30" y="10" width="15" height="120" rx="6"><animate attributeName="height" values="120;60;120" dur="1.2s" begin="0.2s" repeatCount="indefinite"></animate><animate attributeName="y" values="10;40;10" dur="1.2s" begin="0.2s" repeatCount="indefinite"></animate></rect><rect x="60" y="10" width="15" height="120" rx="6"><animate attributeName="height" values="120;60;120" dur="1.2s" begin="0.4s" repeatCount="indefinite"></animate><animate attributeName="y" values="10;40;10" dur="1.2s" begin="0.4s" repeatCount="indefinite"></animate></rect></svg>`);
var root_3 = $.from_svg(`<svg><circle cx="50" cy="50" r="8"><animate attributeName="r" values="8;45" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="opacity" values="0.9;0" dur="1.5s" repeatCount="indefinite"></animate></circle><circle cx="50" cy="50" r="8"><animate attributeName="r" values="8;45" begin="0.5s" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="opacity" values="0.9;0" begin="0.5s" dur="1.5s" repeatCount="indefinite"></animate></circle><circle cx="50" cy="50" r="8"><animate attributeName="r" values="8;45" begin="1s" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="opacity" values="0.9;0" begin="1s" dur="1.5s" repeatCount="indefinite"></animate></circle></svg>`);
var root_4 = $.from_svg(`<svg><g><circle cx="50" cy="20" r="8"></circle><circle cx="73.66" cy="65" r="8"></circle><circle cx="26.34" cy="65" r="8"></circle><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite"></animateTransform></g></svg>`);

export default function Spinner($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, "default"),
		color = $.prop($$props, 'color', 3, "primary"),
		size = $.prop($$props, 'size', 3, "8"),
		currentFill = $.prop($$props, 'currentFill', 3, "inherit"),
		currentColor = $.prop($$props, 'currentColor', 3, "currentColor"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("spinner"));

	let spinnerClass = $.derived(() => spinner({
		type: type(),
		color: color(),
		size: size(),
		class: clsx($.get(theme), $$props.class)
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.attribute_effect(svg, () => ({
				...restProps,
				role: 'status',
				class: $.get(spinnerClass),
				viewBox: '0 0 100 101',
				fill: 'none'
			}));

			var path = $.child(svg);
			var path_1 = $.sibling(path);

			$.reset(svg);

			$.template_effect(() => {
				$.set_attribute(path, 'fill', currentColor());
				$.set_attribute(path_1, 'fill', currentFill());
			});

			$.append($$anchor, svg);
		};

		var consequent_1 = ($$anchor) => {
			var svg_1 = root_1();

			$.attribute_effect(svg_1, () => ({
				...restProps,
				role: 'status',
				class: $.get(spinnerClass),
				viewBox: '0 0 120 30',
				fill: 'currentColor'
			}));

			$.append($$anchor, svg_1);
		};

		var consequent_2 = ($$anchor) => {
			var svg_2 = root_2();

			$.attribute_effect(svg_2, () => ({
				...restProps,
				role: 'status',
				class: $.get(spinnerClass),
				viewBox: '0 0 135 140',
				fill: 'currentColor'
			}));

			$.append($$anchor, svg_2);
		};

		var consequent_3 = ($$anchor) => {
			var svg_3 = root_3();

			$.attribute_effect(svg_3, () => ({
				...restProps,
				role: 'status',
				class: $.get(spinnerClass),
				viewBox: '0 0 100 100'
			}));

			var circle = $.child(svg_3);
			var circle_1 = $.sibling(circle);
			var circle_2 = $.sibling(circle_1);

			$.reset(svg_3);

			$.template_effect(() => {
				$.set_attribute(circle, 'fill', currentFill());
				$.set_attribute(circle_1, 'fill', currentFill());
				$.set_attribute(circle_2, 'fill', currentFill());
			});

			$.append($$anchor, svg_3);
		};

		var consequent_4 = ($$anchor) => {
			var svg_4 = root_4();

			$.attribute_effect(svg_4, () => ({
				...restProps,
				role: 'status',
				class: $.get(spinnerClass),
				viewBox: '0 0 100 100',
				fill: 'currentColor'
			}));

			$.append($$anchor, svg_4);
		};

		$.if(node, ($$render) => {
			if (type() === "default") $$render(consequent); else if (type() === "dots") $$render(consequent_1, 1); else if (type() === "bars") $$render(consequent_2, 2); else if (type() === "pulse") $$render(consequent_3, 3); else if (type() === "orbit") $$render(consequent_4, 4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}