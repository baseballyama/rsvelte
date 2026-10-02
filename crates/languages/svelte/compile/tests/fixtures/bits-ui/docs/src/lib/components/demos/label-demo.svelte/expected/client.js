import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Label } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Minus from "phosphor-svelte/lib/Minus";

var root = $.from_html(`<div class="text-background inline-flex items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center space-x-3"><!> <!></div>`);

export default function Label_demo($$anchor) {
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
				id: 'terms',
				'aria-labelledby': 'terms-label',
				class: 'border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]',
				name: 'hello',
				children,
				$$slots: { default: true }
			});
		});
	}

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
		Label_Root($$anchor, {
			id: 'terms-label',
			for: 'terms',
			class: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Accept terms and conditions');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}