import * as $ from 'svelte/internal/server';
import Command from './command.svelte';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import { cn } from '$lib/utils.js';

export default function Command_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			ref = null,
			value = '',
			title = 'Command Palette',
			description = 'Search for a command to run...',
			showCloseButton = false,
			portalProps,
			children,
			class: className,
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
							if (Dialog.Header) {
								$$renderer.push('<!--[-->');

								Dialog.Header($$renderer, {
									class: 'sr-only',
									children: ($$renderer) => {
										if (Dialog.Title) {
											$$renderer.push('<!--[-->');

											Dialog.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(title)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Dialog.Description) {
											$$renderer.push('<!--[-->');

											Dialog.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(description)}`);
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
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Dialog.Content) {
								$$renderer.push('<!--[-->');

								Dialog.Content($$renderer, {
									class: cn('top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0', className),
									showCloseButton,
									portalProps,
									children: ($$renderer) => {
										Command($$renderer, $.spread_props([
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