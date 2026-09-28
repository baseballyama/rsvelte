import * as $ from 'svelte/internal/server';

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

export default function Demo($$renderer) {
	$$renderer.push(`<div class="mx-auto grid gap-8 py-1 theme-container md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6 2xl:gap-8"><div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><div class="rounded-lg border border-border p-6">`);
	FieldDemo($$renderer, {});
	$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full"><div class="rounded-lg border border-border p-6">`);
	EmptyAvatarGroupDemo($$renderer, {});
	$$renderer.push(`<!----></div> `);
	SpinnerBadgeDemo($$renderer, {});
	$$renderer.push(`<!----> `);
	ButtonGroupInputGroupDemo($$renderer, {});
	$$renderer.push(`<!----> `);
	FieldSliderDemo($$renderer, {});
	$$renderer.push(`<!----> `);
	InputGroupDemo($$renderer, {});
	$$renderer.push(`<!----></div> <div class="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">`);
	InputGroupButtonDemo($$renderer, {});
	$$renderer.push(`<!----> `);
	ItemDemo($$renderer, {});
	$$renderer.push(`<!----> `);

	FieldSeparator($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Appearance Settings`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	AppearanceSettings($$renderer, {});
	$$renderer.push(`<!----></div> <div class="order-first flex flex-col gap-6 lg:hidden xl:order-last xl:flex *:[div]:w-full *:[div]:max-w-full">`);
	NotionPromptForm($$renderer, {});
	$$renderer.push(`<!----> `);
	ButtonGroupDemo($$renderer, {});
	$$renderer.push(`<!----> `);
	FieldCheckbox($$renderer, {});
	$$renderer.push(`<!----> <div class="flex justify-between gap-4">`);
	Nested($$renderer, {});
	$$renderer.push(`<!----> `);
	ButtonGroupPopoverDemo($$renderer, {});
	$$renderer.push(`<!----></div> `);
	FieldHear($$renderer, {});
	$$renderer.push(`<!----> <div class="rounded-lg border border-dashed border-border p-6">`);
	SpinnerEmptyDemo($$renderer, {});
	$$renderer.push(`<!----></div></div></div>`);
}