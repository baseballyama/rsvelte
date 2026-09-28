import 'svelte/internal/disclose-version';
import { ScrollArea } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'wrapText',
	'numParagraphs',
	'height',
	'width'
]);

var root = $.from_html(`<p class="w-full">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos impedit rem,
				repellat deserunt ducimus quasi nisi voluptatem cumque aliquid esse ea deleniti
				eveniet incidunt! Deserunt minus laborum accusamus iusto dolorum. Lorem ipsum dolor
				sit, amet consectetur adipisicing elit. Blanditiis officiis error minima eos fugit
				voluptate excepturi eveniet dolore et, ratione impedit consequuntur dolorem hic quae
				corrupti autem? Dolorem, sit voluptatum.</p>`);

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-[500px] max-w-[500px] flex-col gap-4"><select id="type" data-testid="type"><option>auto</option><option>hover</option><option>scroll</option><option>always</option></select> <input type="number" id="height" data-testid="height"/> <input type="number" id="width" data-testid="width"/> <input type="checkbox" id="wrap"/> <input type="number" id="num-p" data-testid="numParagraphs"/></div> <!> <div data-testid="outside">outside</div>`, 1);

export default function Scroll_area_test($$anchor, $$props) {
	let type = $.prop($$props, 'type', 7, "hover"),
		wrapText = $.prop($$props, 'wrapText', 7, true),
		numParagraphs = $.prop($$props, 'numParagraphs', 7, 3),
		height = $.prop($$props, 'height', 7, 200),
		width = $.prop($$props, 'width', 7, 250),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_2();
	var div = $.first_child(fragment);
	var select = $.child(div);
	var option = $.child(select);

	option.value = option.__value = 'auto';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'hover';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'scroll';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'always';
	$.reset(select);
	$.init_select(select);

	var input = $.sibling(select, 2);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	$.reset(div);

	var node = $.sibling(div, 2);

	$.component(node, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
		ScrollArea_Root($$anchor, $.spread_props(() => restProps, {
			class: 'border-dark-10 bg-background-alt shadow-card relative overflow-hidden rounded-[10px] border px-4 py-4',
			get type() {
				return type();
			},
			'data-testid': 'root',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ScrollArea.Viewport, ($$anchor, ScrollArea_Viewport) => {
					ScrollArea_Viewport($$anchor, {
						class: 'h-full w-full',
						'data-testid': 'viewport',
						get style() {
							return `width: ${width() ?? ''}px; height: ${height() ?? ''}px;`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 17, () => Array(numParagraphs()), $.index, ($$anchor, _) => {
								var p = root();
								let styles;

								$.template_effect(() => styles = $.set_style(p, '', styles, { 'text-wrap': wrapText() ? "wrap" : "nowrap" }));
								$.append($$anchor, p);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar) => {
					ScrollArea_Scrollbar($$anchor, {
						orientation: 'vertical',
						'data-testid': 'scrollbar-y',
						class: 'h-full w-2 bg-blue-500',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb) => {
								ScrollArea_Thumb($$anchor, { 'data-testid': 'thumb-y', class: 'h-full w-full bg-blue-200' });
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar_1) => {
					ScrollArea_Scrollbar_1($$anchor, {
						orientation: 'horizontal',
						'data-testid': 'scrollbar-x',
						class: 'h-2 w-full bg-red-500',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.component(node_6, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb_1) => {
								ScrollArea_Thumb_1($$anchor, { 'data-testid': 'thumb-x', class: 'h-full w-full bg-red-200' });
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_5, 2);

				$.component(node_7, () => ScrollArea.Corner, ($$anchor, ScrollArea_Corner) => {
					ScrollArea_Corner($$anchor, { 'data-testid': 'corner' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.next(2);
	$.bind_select_value(select, type);
	$.bind_value(input, height);
	$.bind_value(input_1, width);
	$.bind_checked(input_2, wrapText);
	$.bind_value(input_3, numParagraphs);
	$.append($$anchor, fragment);
}