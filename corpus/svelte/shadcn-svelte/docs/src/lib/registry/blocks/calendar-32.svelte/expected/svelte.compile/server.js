import * as $ from 'svelte/internal/server';
import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus";
import { getLocalTimeZone } from "@internationalized/date";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_32($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		let open = false;
		let value = void 0;

		const triggerLabel = $.derived(() => {
			if (value) return value.toDate(getLocalTimeZone()).toLocaleDateString();

			return "Select date";
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-date`,
				class: 'px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Date of birth`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Drawer.Root) {
				$$renderer.push('<!--[-->');

				Drawer.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										class: 'w-48 justify-between font-normal',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(triggerLabel())} `);
											CalendarPlusIcon($$renderer, {});
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');
								Drawer.Trigger($$renderer, { id: `${id}-date`, child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Drawer.Content) {
							$$renderer.push('<!--[-->');

							Drawer.Content($$renderer, {
								class: 'w-auto overflow-hidden p-0',
								children: ($$renderer) => {
									if (Drawer.Header) {
										$$renderer.push('<!--[-->');

										Drawer.Header($$renderer, {
											class: 'sr-only',
											children: ($$renderer) => {
												if (Drawer.Title) {
													$$renderer.push('<!--[-->');

													Drawer.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Select date`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Drawer.Description) {
													$$renderer.push('<!--[-->');

													Drawer.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Set your date of birth`);
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

									Calendar($$renderer, {
										type: 'single',
										captionLayout: 'dropdown',
										onValueChange: (v) => {
											if (v) {
												open = false;
											}
										},
										class: 'mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]',
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!---->`);
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

			$$renderer.push(` <div class="px-1 text-sm text-muted-foreground">This example works best on mobile.</div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}