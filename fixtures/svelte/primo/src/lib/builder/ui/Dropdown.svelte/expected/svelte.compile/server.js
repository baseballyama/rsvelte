import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { buttonVariants } from '$lib/components/ui/button';

export default function Dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import { toast } from '@zerodevx/svelte-toast';
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {string} [label]
		 * @property {string} [icon]
		 * @property {'sm' | 'lg'} [size]
		 * @property {1 | 2} [px]
		 * @property {any} [options]
		 * @property {any} [dividers]
		 * @property {string} [variant]
		 */
		/** @type {Props} */
		let {
			label = '',
			icon = 'carbon:overflow-menu-vertical',
			options = [],
			dividers = [],
			px = 1,
			size = 'sm'
		} = $$props;

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, {
							class: buttonVariants({
								variant: 'ghost',
								size,
								class: `py-1 px-${px} rounded-md focus-visible:ring-1 focus-visible:ring-[var(--primo-primary-color)] focus-visible:outline-none`
							}),

							children: ($$renderer) => {
								if (label) {
									$$renderer.push('<!--[0-->');
									Icon($$renderer, { icon });
									$$renderer.push(`<!----> <p>${$.escape(label)}</p> <span class="dropdown-icon">`);
									Icon($$renderer, { icon: 'mi:select' });
									$$renderer.push(`<!----></span>`);
								} else {
									$$renderer.push('<!--[-1-->');
									Icon($$renderer, { icon });
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (DropdownMenu.Content) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Content($$renderer, {
							class: 'text-sm bg-[#171717] border-[#292929] border-[1px] z-999999999',
							children: ($$renderer) => {
								if (DropdownMenu.Group) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Group($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="options"><!--[-->`);

											const each_array = $.ensure_array_like(options);

											for (let i = 0, $$length = each_array.length; i < $$length; i++) {
												let option = each_array[i];

												if (DropdownMenu.Item) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Item($$renderer, {
														class: `p-1 rounded ${option.danger ? 'text-[var(--primo-color-danger)]' : ''} ${option.disabled ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'}`,
														disabled: option.disabled,
														onSelect: (e) => {
															if (option.disabled) return;

															if (option.on_click) {
																option.on_click(e);
															} else {
																dispatch('input', option.value);
															}
														},

														children: ($$renderer) => {
															$$renderer.push(`<div class="flex items-center gap-2">`);
															Icon($$renderer, { icon: option.icon });
															$$renderer.push(`<!----> <span>${$.escape(option.label)}</span></div>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (dividers.includes(i)) {
													$$renderer.push('<!--[0-->');

													if (DropdownMenu.Separator) {
														$$renderer.push('<!--[-->');
														DropdownMenu.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--></div>`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}