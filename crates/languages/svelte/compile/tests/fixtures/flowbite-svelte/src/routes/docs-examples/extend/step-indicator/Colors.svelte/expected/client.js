import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StepIndicator, Radio, Label } from "flowbite-svelte";

var root = $.from_html(`<div class="my-4"><!></div> <div class="flex flex-wrap space-x-2"><!> <!></div>`, 1);

export default function Colors($$anchor) {
	const binding_group = [];

	const colors = [
		"primary",
		"secondary",
		"gray",
		"red",
		"yellow",
		"green",
		"indigo",
		"purple",
		"pink",
		"blue"
	];

	let color = $.state("green");
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

		get color() {
			return $.get(color);
		},

		set color($$value) {
			$.set(color, $$value, true);
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		class: 'mb-4 w-full font-bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Color');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => colors, $.index, ($$anchor, colorOption) => {
		Radio($$anchor, {
			class: 'my-1',
			classes: { label: "w-24" },
			name: 'color',
			get color() {
				return $.get(colorOption);
			},

			get value() {
				return $.get(colorOption);
			},

			get group() {
				return $.get(color);
			},

			set group($$value) {
				$.set(color, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(colorOption)));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}