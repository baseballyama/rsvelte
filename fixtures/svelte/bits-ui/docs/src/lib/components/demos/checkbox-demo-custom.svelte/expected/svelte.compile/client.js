import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Label, useId } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Minus from "phosphor-svelte/lib/Minus";
import DemoContainer from "../demo-container.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'checked',
	'ref',
	'labelText'
]);

var root = $.from_html(`<div class="text-background inline-flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center space-x-3"><!> <!></div>`);

export default function Checkbox_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		checked = $.prop($$props, 'checked', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	DemoContainer($$anchor, {
		size: 'xs',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$anchor, $$slotProps) => {
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
					Checkbox_Root($$anchor, $.spread_props(
						{
							get id() {
								return id();
							},
							'aria-labelledby': 'terms-label',
							class: 'border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 data-disabled:cursor-not-allowed data-disabled:opacity-70 data-disabled:pointer-events-none  peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]',
							name: 'hello'
						},
						() => restProps,
						{
							get ref() {
								return ref();
							},

							set ref($$value) {
								ref($$value);
							},

							get checked() {
								return checked();
							},

							set checked($$value) {
								checked($$value);
							},
							children,
							$$slots: { default: true }
						}
					));
				});
			}

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
				Label_Root($$anchor, {
					id: 'terms-label',
					get for() {
						return id();
					},
					class: 'text-sm font-medium leading-none peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $$props.labelText));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}