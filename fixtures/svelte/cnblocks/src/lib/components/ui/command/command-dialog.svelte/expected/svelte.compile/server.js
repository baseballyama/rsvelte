import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive, Dialog as DialogPrimitive } from "bits-ui";
import Command from "./command.svelte";
import * as Dialog from "$lib/components/ui/dialog/index.js";

export default function Command_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			ref = null,
			value = "",
			portalProps,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, $.spread_props([
					restProps,
					{
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									class: 'overflow-hidden p-0',
									portalProps,
									children: ($$renderer) => {
										Command($$renderer, $.spread_props([
											{
												class: '[&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group]]:px-2 [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0 [&_[data-cmdk-input-wrapper]_svg]:h-5 [&_[data-cmdk-input-wrapper]_svg]:w-5 [&_[data-cmdk-input]]:h-12 [&_[data-cmdk-item]]:px-2 [&_[data-cmdk-item]]:py-3 [&_[data-cmdk-item]_svg]:h-5 [&_[data-cmdk-item]_svg]:w-5'
											},
											restProps,
											{
												children,
												get value() {
													return value;
												},

												set value($$value) {
													value = $$value;
													$$settled = false;
												},

												get ref() {
													return ref;
												},

												set ref($$value) {
													ref = $$value;
													$$settled = false;
												}
											}
										]));
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open, ref, value });
	});
}