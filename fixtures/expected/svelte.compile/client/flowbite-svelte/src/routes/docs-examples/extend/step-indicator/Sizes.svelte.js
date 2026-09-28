import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StepIndicator, Radio, Label } from "flowbite-svelte";

var root = $.from_html(`<div class="my-4"><!></div> <div class="flex flex-wrap space-x-2"><!> <!></div>`, 1);

export default function Sizes($$anchor) {
	const binding_group = [];
	const sizes = ["xs", "sm", "md", "lg", "xl"];
	let size = $.state("xs");
	let currentStep = 2;
	let steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	StepIndicator(node, {
		currentStep,
		get steps() {
			return steps;
		},

		get size() {
			return $.get(size);
		},

		set size($$value) {
			$.set(size, $$value, true);
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		class: 'mb-4 w-full font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Size');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => sizes, $.index, ($$anchor, sizeOption) => {
		Radio($$anchor, {
			class: 'my-1',
			classes: { label: "w-24" },
			name: 'size',
			get value() {
				return $.get(sizeOption);
			},

			get group() {
				return $.get(size);
			},

			set group($$value) {
				$.set(size, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(sizeOption)));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}