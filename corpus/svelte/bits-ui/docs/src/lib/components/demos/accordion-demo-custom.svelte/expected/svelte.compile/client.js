import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";
import DemoContainer from "../demo-container.svelte";
import CustomAccordionItem from "./accordion-demo-custom-item.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'items', 'value', 'ref']);

export default function Accordion_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	const myItems = [
		{
			value: "A",
			title: "Title A",
			content: "Content A",
			disabled: false
		},

		{
			value: "B",
			title: "Title B",
			content: "Content B",
			disabled: false
		},

		{
			value: "C",
			title: "Title C",
			content: "Content C",
			disabled: false
		}
	];

	let items = $.prop($$props, 'items', 3, myItems),
		value = $.prop($$props, 'value', 15),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	DemoContainer($$anchor, {
		size: 'sm',
		wrapperClass: 'rounded-b-card',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
				Accordion_Root($$anchor, $.spread_props({ class: 'w-full sm:max-w-[70%]' }, () => restProps, {
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},

					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 19, items, (item, i) => item.title + i, ($$anchor, item) => {
							CustomAccordionItem($$anchor, $.spread_props(() => $.get(item)));
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}