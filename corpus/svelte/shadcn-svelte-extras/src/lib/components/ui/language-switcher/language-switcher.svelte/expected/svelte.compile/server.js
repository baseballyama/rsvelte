import * as $ from 'svelte/internal/server';
import GlobeIcon from '@lucide/svelte/icons/globe';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { buttonVariants } from '$lib/components/ui/button';
import { cn } from '$lib/utils.js';

export default function Language_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			languages = [],
			value = '',
			align = 'end',
			variant = 'outline',
			onChange,
			class: className
		} = $$props;

		// set default code if there isn't one selected
		if (value === '') {
			value = languages[0].code;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								class: cn(buttonVariants({ variant, size: 'icon' }), className),
								'aria-label': 'Change language',
								children: ($$renderer) => {
									GlobeIcon($$renderer, { class: 'size-4' });
									$$renderer.push(`<!----> <span class="sr-only">Change language</span>`);
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
								align,
								children: ($$renderer) => {
									if (DropdownMenu.RadioGroup) {
										$$renderer.push('<!--[-->');

										DropdownMenu.RadioGroup($$renderer, {
											onValueChange: onChange,
											get value() {
												return value;
											},

											set value($$value) {
												value = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(languages);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let language = each_array[$$index];

													if (DropdownMenu.RadioItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.RadioItem($$renderer, {
															value: language.code,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(language.label)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}