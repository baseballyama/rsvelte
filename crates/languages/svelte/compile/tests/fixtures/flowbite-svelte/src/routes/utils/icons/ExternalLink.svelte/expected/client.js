import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'role',
	'color',
	'strokeWidth',
	'title',
	'desc',
	'ariaLabel'
]);

var root = $.from_svg(`<title> </title>`);
var root_1 = $.from_svg(`<desc> </desc>`);
var root_2 = $.from_svg(`<svg><!><!><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path><path d="M11 13l9 -9"></path><path d="M15 4h5v5"></path></svg>`);

export default function ExternalLink($$anchor, $$props) {
	$.push($$props, true);

	const ctx = getContext("iconCtx") ?? {};

	let size = $.prop($$props, 'size', 19, () => ctx.size || "24"),
		role = $.prop($$props, 'role', 19, () => ctx.role || "img"),
		color = $.prop($$props, 'color', 19, () => ctx.color || "currentColor"),
		strokeWidth = $.prop($$props, 'strokeWidth', 19, () => ctx.strokeWidth || "2"),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "external link"),
		restProps = $.rest_props($$props, rest_excludes);

	let ariaDescribedby = $.derived(() => `${$$props.title?.id || ""} ${$$props.desc?.id || ""}`);
	const hasDescription = $.derived(() => !!($$props.title?.id || $$props.desc?.id));
	var svg = root_2();

	$.attribute_effect(svg, () => ({
		xmlns: 'http://www.w3.org/2000/svg',
		...restProps,
		role: role(),
		width: size(),
		height: size(),
		'aria-label': ariaLabel(),
		'aria-describedby': $.get(hasDescription) ? $.get(ariaDescribedby) : undefined,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: color(),
		'stroke-width': strokeWidth(),
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round'
	}));

	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var title_1 = root();
			var text = $.only_child(title_1, true);

			$.template_effect(() => {
				$.set_attribute(title_1, 'id', $$props.title.id);
				$.set_text(text, $$props.title.title);
			});

			$.append($$anchor, title_1);
		};

		$.if(node, ($$render) => {
			if ($$props.title?.id && $$props.title.title) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node);

	{
		var consequent_1 = ($$anchor) => {
			var desc_1 = root_1();
			var text_1 = $.only_child(desc_1, true);

			$.template_effect(() => {
				$.set_attribute(desc_1, 'id', $$props.desc.id);
				$.set_text(text_1, $$props.desc.desc);
			});

			$.append($$anchor, desc_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.desc?.id && $$props.desc.desc) $$render(consequent_1);
		});
	}

	$.next(3);
	$.reset(svg);
	$.append($$anchor, svg);
	$.pop();
}