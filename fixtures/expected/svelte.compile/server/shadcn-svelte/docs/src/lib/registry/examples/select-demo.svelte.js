import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";

export default function Select_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const fruits = [
			{ value: "apple", label: "Apple" },
			{ value: "banana", label: "Banana" },
			{ value: "blueberry", label: "Blueberry" },
			{ value: "grapes", label: "Grapes" },
			{ value: "pineapple", label: "Pineapple" }
		];

		let value = "";
		const triggerContent = $.derived(() => fruits.find((f) => f.value === value)?.label ?? "Select a fruit");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					name: 'favoriteFruit',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								class: 'w-[180px]',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(triggerContent())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								children: ($$renderer) => {
									if (Select.Group) {
										$$renderer.push('<!--[-->');

										Select.Group($$renderer, {
											children: ($$renderer) => {
												if (Select.Label) {
													$$renderer.push('<!--[-->');

													Select.Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Fruits`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <!--[-->`);

												const each_array = $.ensure_array_like(fruits);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let fruit = each_array[$$index];

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: fruit.value,
															label: fruit.label,
															disabled: fruit.value === "grapes",
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(fruit.label)}`);
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
	});
}