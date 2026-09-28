import * as $ from 'svelte/internal/server';
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Date_picker_with_dropdowns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const df = new DateFormatter("en-US", { dateStyle: "long" });
		let date = void 0;
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Date Picker with Dropdowns',
				children: ($$renderer) => {
					if (Field.Field) {
						$$renderer.push('<!--[-->');

						Field.Field($$renderer, {
							class: 'mx-auto w-72',
							children: ($$renderer) => {
								if (Popover.Root) {
									$$renderer.push('<!--[-->');

									Popover.Root($$renderer, {
										get open() {
											return open;
										},

										set open($$value) {
											open = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'date-picker-with-dropdowns-desktop',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Date`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											{
												function child($$renderer, { props }) {
													Button($$renderer, $.spread_props([
														props,
														{
															variant: 'outline',
															id: 'date-picker-with-dropdowns-desktop',
															class: 'justify-start px-2.5 font-normal',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(date
																	? df.format(date.toDate(getLocalTimeZone()))
																	: "Pick a date")} `);

																IconPlaceholder($$renderer, {
																	lucide: 'ChevronDownIcon',
																	tabler: 'IconChevronDown',
																	hugeicons: 'ArrowDownIcon',
																	phosphor: 'CaretDownIcon',
																	remixicon: 'RiArrowDownSLine',
																	'data-icon': 'inline-start',
																	class: 'ml-auto'
																});

																$$renderer.push(`<!---->`);
															},
															$$slots: { default: true }
														}
													]));
												}

												if (Popover.Trigger) {
													$$renderer.push('<!--[-->');
													Popover.Trigger($$renderer, { child, $$slots: { child: true } });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(` `);

											if (Popover.Content) {
												$$renderer.push('<!--[-->');

												Popover.Content($$renderer, {
													class: 'w-auto p-0',
													align: 'start',
													children: ($$renderer) => {
														Calendar($$renderer, {
															type: 'single',
															captionLayout: 'dropdown',
															get value() {
																return date;
															},

															set value($$value) {
																date = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> <div class="flex gap-2 border-t p-2">`);

														Button($$renderer, {
															variant: 'outline',
															size: 'sm',
															class: 'w-full',
															onclick: () => open = false,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Done`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----></div>`);
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
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}