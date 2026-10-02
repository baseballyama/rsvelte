import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps } from "svelte-toolbelt";
import { useId } from "$lib/internal/use-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'children',
	'child',
	'width',
	'height'
]);

var root = $.from_svg(`<svg viewBox="0 0 30 10" preserveAspectRatio="none" data-arrow=""><polygon points="0,0 30,0 15,10" fill="currentColor"></polygon></svg>`);
var root_1 = $.from_html(`<span><!></span>`);

export default function Arrow($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		width = $.prop($$props, 'width', 3, 10),
		height = $.prop($$props, 'height', 3, 5),
		restProps = $.rest_props($$props, rest_excludes);

	const mergedProps = $.derived(() => mergeProps(restProps, { id: id() }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var span = root_1();

			$.attribute_effect(span, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(span);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.snippet(node_3, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var svg = root();

					$.template_effect(() => {
						$.set_attribute(svg, 'width', width());
						$.set_attribute(svg, 'height', height());
					});

					$.append($$anchor, svg);
				};

				$.if(node_2, ($$render) => {
					if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}