import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Button from "$lib/buttons/Button.svelte";
import GradientButton from "$lib/buttons/GradientButton.svelte";

const moving_cross = ($$anchor) => {
	var svg = root();

	$.append($$anchor, svg);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'name',
	'gradient',
	'icon',
	'pill',
	'color',
	'class'
]);

var root = $.from_svg(`<svg aria-hidden="true" class="h-8 w-8 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`);
var root_1 = $.from_html(`<!> <span class="sr-only"> </span>`, 1);

export default function SpeedDialTrigger($$anchor, $$props) {
	$.push($$props, true);

	let name = $.prop($$props, 'name', 3, "Open actions menu"),
		gradient = $.prop($$props, 'gradient', 3, false),
		pill = $.prop($$props, 'pill', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const buttonProps = $.derived(() => ({
		pill: pill(),
		color: $$props.color,
		...restProps,
		class: ["group p-3!", clsx($$props.class)]
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			GradientButton($$anchor, $.spread_props(() => $.get(buttonProps), {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.snippet(node_2, () => $$props.icon);
							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							moving_cross($$anchor);
						};

						$.if(node_1, ($$render) => {
							if ($$props.icon) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var span = $.sibling(node_1, 2);
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, name()));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		};

		var alternate_2 = ($$anchor) => {
			Button($$anchor, $.spread_props(() => $.get(buttonProps), {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_3 = $.first_child(fragment_6);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_7 = $.comment();
							var node_4 = $.first_child(fragment_7);

							$.snippet(node_4, () => $$props.icon);
							$.append($$anchor, fragment_7);
						};

						var alternate_1 = ($$anchor) => {
							moving_cross($$anchor);
						};

						$.if(node_3, ($$render) => {
							if ($$props.icon) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					var span_1 = $.sibling(node_3, 2);
					var text_1 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_1, name()));
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			}));
		};

		$.if(node, ($$render) => {
			if (gradient()) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}