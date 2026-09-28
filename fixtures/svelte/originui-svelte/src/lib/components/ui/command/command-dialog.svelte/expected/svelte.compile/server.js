import * as $ from 'svelte/internal/server';
import Command from './command.svelte';
import * as Dialog from '$lib/components/ui/dialog';

export default function Command_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			open = false,
			portalProps,
			ref = null,
			value = '',
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
									class: 'overflow-hidden p-0 sm:max-w-lg [&>button:last-child]:hidden',
									portalProps,
									children: ($$renderer) => {
										Command($$renderer, $.spread_props([
											{
												class: '**:data-command-group-heading:text-muted-foreground **:data-command-group:px-2 **:data-command-group-heading:px-2 **:data-command-group-heading:font-medium **:data-command-input:h-12  **:data-command-item:px-3 **:data-command-item:py-2 '
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