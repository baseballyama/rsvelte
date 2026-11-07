import * as $ from 'svelte/internal/server';
import { Combobox, mergeProps } from "bits-ui";
import ChevronUpDown from "phosphor-svelte/lib/CaretUpDown";

export default function Combobox_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			value = void 0,
			open = false,
			inputProps,
			contentProps,
			type,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let searchValue = "";

		const filteredItems = $.derived(() => {
			if (searchValue === "") return items;

			return items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));
		});

		function handleInput(e) {
			searchValue = e.currentTarget.value;
		}

		function handleOpenChange(newOpen) {
			if (!newOpen) searchValue = "";
		}

		const mergedRootProps = $.derived(() => mergeProps(restProps, { onOpenChange: handleOpenChange }));
		const mergedInputProps = $.derived(() => mergeProps(inputProps, { oninput: handleInput }));

		let inputValue = $.derived(() => {
			return items.find((item) => item.value === value)?.label;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Combobox.Root) {
				$$renderer.push('<!--[-->');

				Combobox.Root($$renderer, $.spread_props([
					{ inputValue: inputValue() },
					mergedRootProps(),
					{
						type,
						items,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<div class="relative">`);

							if (Combobox.Input) {
								$$renderer.push('<!--[-->');

								Combobox.Input($$renderer, $.spread_props([
									mergedInputProps(),
									{
										class: 'border-input bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Combobox.Trigger) {
								$$renderer.push('<!--[-->');

								Combobox.Trigger($$renderer, {
									class: 'absolute end-3 top-1/2 size-6 -translate-y-1/2',
									children: ($$renderer) => {
										ChevronUpDown($$renderer, { class: 'text-muted-foreground h-5 w-5' });
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</div> `);

							if (Combobox.Portal) {
								$$renderer.push('<!--[-->');

								Combobox.Portal($$renderer, {
									children: ($$renderer) => {
										if (Combobox.Content) {
											$$renderer.push('<!--[-->');

											Combobox.Content($$renderer, $.spread_props([
												contentProps,
												{
													class: 'z-50  mt-2 w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)]  rounded-md border bg-white p-1 shadow-md outline-none',
													children: ($$renderer) => {
														const each_array = $.ensure_array_like(filteredItems());

														if (each_array.length !== 0) {
															$$renderer.push('<!--[-->');

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let item = each_array[$$index];

																{
																	function children($$renderer, { selected }) {
																		$$renderer.push(`<div class="flex w-full flex-col"><span${$.attr_class($.clsx(selected ? "font-medium text-red-500" : ""))}>${$.escape(item.label)}</span></div>`);
																	}

																	if (Combobox.Item) {
																		$$renderer.push('<!--[-->');

																		Combobox.Item($$renderer, {
																			value: item.value,
																			label: item.label,
																			class: 'relative flex w-full cursor-pointer select-none items-center rounded-sm p-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
																			children,
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																}
															}
														} else {
															$$renderer.push(`<!--[!--><span>No results found</span>`);
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												}
											]));

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
		$.bind_props($$props, { value, open });
	});
}