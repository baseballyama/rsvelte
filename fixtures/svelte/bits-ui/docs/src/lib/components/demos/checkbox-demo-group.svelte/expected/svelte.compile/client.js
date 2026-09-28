import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Label, useId } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Minus from "phosphor-svelte/lib/Minus";

const MyCheckbox = ($$anchor, $$arg0) => {
	let value = () => ($$arg0?.()).value;
	let label = () => ($$arg0?.()).label;
	const id = $.derived(useId);
	var div = root_1();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			let indeterminate = () => ($$arg0?.()).indeterminate;
			var div_1 = root();
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					Minus($$anchor, { class: 'size-[15px]', weight: 'bold' });
				};

				var consequent_1 = ($$anchor) => {
					Check($$anchor, { class: 'size-[15px]', weight: 'bold' });
				};

				$.if(node_1, ($$render) => {
					if (indeterminate()) $$render(consequent); else if (checked()) $$render(consequent_1, 1);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.component(node, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
			Checkbox_Root($$anchor, {
				get id() {
					return $.get(id);
				},

				get 'aria-labelledby'() {
					return `${$.get(id) ?? ''}-label`;
				},
				class: 'border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]',
				name: 'hello',
				get value() {
					return value();
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
		Label_Root($$anchor, {
			get id() {
				return `${$.get(id) ?? ''}-label`;
			},

			get for() {
				return $.get(id);
			},
			class: 'pl-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, label()));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
};

var root = $.from_html(`<div class="text-background inline-flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center"><!> <!></div>`);
var root_2 = $.from_html(`<!> <div class="flex flex-col gap-4"><!> <!> <!> <!></div>`, 1);

export default function Checkbox_demo_group($$anchor, $$props) {
	$.push($$props, true);

	let myValue = $.state($.proxy(["marketing", "news"]));
	var fragment_3 = $.comment();
	var node_3 = $.first_child(fragment_3);

	$.component(node_3, () => Checkbox.Group, ($$anchor, Checkbox_Group) => {
		Checkbox_Group($$anchor, {
			class: 'flex flex-col gap-3',
			name: 'notifications',
			onValueChange: console.log,
			get value() {
				return $.get(myValue);
			},

			set value($$value) {
				$.set(myValue, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_2();
				var node_4 = $.first_child(fragment_4);

				$.component(node_4, () => Checkbox.GroupLabel, ($$anchor, Checkbox_GroupLabel) => {
					Checkbox_GroupLabel($$anchor, {
						class: 'text-foreground-alt text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Notifications');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var div_2 = $.sibling(node_4, 2);
				var node_5 = $.child(div_2);

				MyCheckbox(node_5, () => ({ label: "Marketing", value: "marketing" }));

				var node_6 = $.sibling(node_5, 2);

				MyCheckbox(node_6, () => ({ label: "Promotions", value: "promotions" }));

				var node_7 = $.sibling(node_6, 2);

				MyCheckbox(node_7, () => ({ label: "News", value: "news" }));

				var node_8 = $.sibling(node_7, 2);

				MyCheckbox(node_8, () => ({ label: "Updates", value: "updates" }));
				$.reset(div_2);
				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_3);
	$.pop();
}