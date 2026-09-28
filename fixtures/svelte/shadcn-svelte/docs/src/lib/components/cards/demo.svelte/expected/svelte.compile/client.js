import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	FieldSliderDemo,
	ButtonGroupInputGroupDemo,
	SpinnerBadgeDemo,
	InputGroupDemo,
	EmptyAvatarGroupDemo,
	FieldDemo,
	ButtonGroupDemo,
	SpinnerEmptyDemo,
	ButtonGroupPopoverDemo
} from "$lib/registry/examples/index.js";

import { FieldSeparator } from "$lib/registry/ui/field/index.js";
import AppearanceSettings from "./appearance-settings.svelte";
import FieldCheckbox from "./field-checkbox.svelte";
import FieldHear from "./field-hear.svelte";
import InputGroupButtonDemo from "./input-group-button-demo.svelte";
import ItemDemo from "./item-demo.svelte";
import Nested from "./nested.svelte";
import NotionPromptForm from "./notion-prompt-form.svelte";

var root = $.from_html(`<div class="mx-auto grid gap-8 py-1 theme-container md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 2xl:gap-8"><div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><div class="rounded-lg border border-border p-6"><!></div></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><div class="rounded-lg border border-border p-6"><!></div> <!> <!> <!> <!></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><!> <!> <!> <!></div> <div class="order-first flex flex-col gap-6 lg:hidden xl:order-last xl:flex *:[div]:w-full *:[div]:max-w-full"><!> <!> <!> <div class="flex justify-between gap-4"><!> <!></div> <!> <div class="rounded-lg border border-dashed border-border p-6"><!></div></div></div>`);

export default function Demo($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	FieldDemo(node, {});
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var node_1 = $.child(div_4);

	EmptyAvatarGroupDemo(node_1, {});
	$.reset(div_4);

	var node_2 = $.sibling(div_4, 2);

	SpinnerBadgeDemo(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	ButtonGroupInputGroupDemo(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	FieldSliderDemo(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	InputGroupDemo(node_5, {});
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var node_6 = $.child(div_5);

	InputGroupButtonDemo(node_6, {});

	var node_7 = $.sibling(node_6, 2);

	ItemDemo(node_7, {});

	var node_8 = $.sibling(node_7, 2);

	FieldSeparator(node_8, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Appearance Settings');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	AppearanceSettings(node_9, {});
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_10 = $.child(div_6);

	NotionPromptForm(node_10, {});

	var node_11 = $.sibling(node_10, 2);

	ButtonGroupDemo(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	FieldCheckbox(node_12, {});

	var div_7 = $.sibling(node_12, 2);
	var node_13 = $.child(div_7);

	Nested(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	ButtonGroupPopoverDemo(node_14, {});
	$.reset(div_7);

	var node_15 = $.sibling(div_7, 2);

	FieldHear(node_15, {});

	var div_8 = $.sibling(node_15, 2);
	var node_16 = $.child(div_8);

	SpinnerEmptyDemo(node_16, {});
	$.reset(div_8);
	$.reset(div_6);
	$.reset(div);
	$.append($$anchor, div);
}