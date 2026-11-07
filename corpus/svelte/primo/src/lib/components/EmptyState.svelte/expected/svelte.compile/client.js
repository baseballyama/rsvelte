import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';

var root = $.from_html(`<span> </span> <!>`, 1);
var root_1 = $.from_html(`<div><div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full dark:bg-gray-800"><!></div> <div class="space-y-2 text-center"><h2 class="text-2xl font-bold tracking-tight"> </h2> <p class="text-gray-500 dark:text-gray-400 text-balance max-w-[30rem]"> </p></div> <!></div>`);

export default function EmptyState($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		link = $.prop($$props, 'link', 3, null),
		button = $.prop($$props, 'button', 3, null);

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => $$props.icon, ($$anchor, $$component) => {
		$$component($$anchor, { class: 'w-10 h-10 text-gray-500 dark:text-gray-400' });
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var h2 = $.child(div_2);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			Button($$anchor, {
				get href() {
					return link().url;
				},
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var span = $.first_child(fragment_1);
					var text_2 = $.only_child(span, true);
					var node_2 = $.sibling(span, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => link().icon, ($$anchor, $$component) => {
								$$component($$anchor, {});
							});

							$.append($$anchor, fragment_2);
						};

						$.if(node_2, ($$render) => {
							if (link().icon) $$render(consequent);
						});
					}

					$.template_effect(() => $.set_text(text_2, link().label));
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		var consequent_3 = ($$anchor) => {
			Button($$anchor, {
				get onclick() {
					return button().onclick;
				},
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var span_1 = $.first_child(fragment_4);
					var text_3 = $.only_child(span_1, true);
					var node_4 = $.sibling(span_1, 2);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_5 = $.first_child(fragment_5);

							$.component(node_5, () => button().icon, ($$anchor, $$component) => {
								$$component($$anchor, {});
							});

							$.append($$anchor, fragment_5);
						};

						$.if(node_4, ($$render) => {
							if (button().icon) $$render(consequent_2);
						});
					}

					$.template_effect(() => $.set_text(text_3, button().label));
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if (link()) $$render(consequent_1); else if (button()) $$render(consequent_3, 1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `flex flex-col items-center justify-center gap-6 flex-1 ${className() ?? ''}`);
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, div);
	$.pop();
}