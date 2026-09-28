import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import * as InputGroup from '$lib/components/ui/input-group/index.js';
import SearchIcon from '@lucide/svelte/icons/search';

export default function Command_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div data-slot="command-input-wrapper" class="p-1 pb-0">`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					class: 'h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!',
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								if (InputGroup.Input) {
									$$renderer.push('<!--[-->');

									InputGroup.Input($$renderer, $.spread_props([
										props,
										{
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

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							if (CommandPrimitive.Input) {
								$$renderer.push('<!--[-->');

								CommandPrimitive.Input($$renderer, $.spread_props([
									{
										value,
										'data-slot': 'command-input',
										class: cn('w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50', className)
									},
									restProps,
									{ child, $$slots: { child: true } }
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								children: ($$renderer) => {
									SearchIcon($$renderer, { class: 'size-4 shrink-0 opacity-50' });
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, value });
	});
}