import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";

export default function Field_select_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let department = void 0;

		const departments = [
			{ value: "engineering", label: "Engineering" },
			{ value: "design", label: "Design" },
			{ value: "marketing", label: "Marketing" },
			{ value: "sales", label: "Sales" },
			{ value: "support", label: "Customer Support" },
			{ value: "hr", label: "Human Resources" },
			{ value: "finance", label: "Finance" },
			{ value: "operations", label: "Operations" }
		];

		const departmentLabel = $.derived(() => departments.find((d) => d.value === department)?.label ?? "Choose department");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="w-full max-w-md">`);

			if (Field.Field) {
				$$renderer.push('<!--[-->');

				Field.Field($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'department',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Department`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Root) {
							$$renderer.push('<!--[-->');

							Select.Root($$renderer, {
								type: 'single',
								get value() {
									return department;
								},

								set value($$value) {
									department = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Select.Trigger) {
										$$renderer.push('<!--[-->');

										Select.Trigger($$renderer, {
											id: 'department',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(departmentLabel())}`);
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
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(departments);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let department = each_array[$$index];

													if (Select.Item) {
														$$renderer.push('<!--[-->');
														Select.Item($$renderer, $.spread_props([department]));
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

						$$renderer.push(` `);

						if (Field.Description) {
							$$renderer.push('<!--[-->');

							Field.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Select your department or area of work.`);
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
	});
}