import * as $ from 'svelte/internal/server';
import "../../app.css";
import { Select } from "bits-ui";

export default function Select_scroll_jump_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = Array.from({ length: 120 }, (_, i) => ({ value: `${i}`, label: `Item ${i}` }));
		let value = "90";
		let open = false;
		const selectedLabel = $.derived(() => items.find((item) => item.value === value)?.label ?? "Open Listbox");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main"><div data-testid="spacer-top" style="height: 900px;"></div> <div data-testid="anchor-zone" style="padding-left: 64px;">`);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
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
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								'data-testid': 'trigger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedLabel())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Portal) {
							$$renderer.push('<!--[-->');

							Select.Portal($$renderer, {
								children: ($$renderer) => {
									if (Select.Content) {
										$$renderer.push('<!--[-->');

										Select.Content($$renderer, {
											'data-testid': 'content',
											preventScroll: false,
											side: 'bottom',
											sideOffset: 8,
											style: { width: "220px", maxHeight: "220px", backgroundColor: "white" },
											children: ($$renderer) => {
												if (Select.Viewport) {
													$$renderer.push('<!--[-->');

													Select.Viewport($$renderer, {
														'data-testid': 'viewport',
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(items);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let item = each_array[$$index];

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: item.value,
																		label: item.label,
																		'data-testid': `item-${item.value}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.label)}`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div data-testid="spacer-bottom" style="height: 2000px;"></div> <div data-testid="open-binding">${$.escape(open ? "true" : "false")}</div></main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}