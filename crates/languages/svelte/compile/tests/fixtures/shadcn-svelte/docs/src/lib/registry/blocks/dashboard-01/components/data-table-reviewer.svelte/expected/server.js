import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Data_table_reviewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;
		const isAssigned = $.derived(() => row.original.reviewer !== "Assign reviewer");
		let reviewer = "";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isAssigned()) {
				$$renderer.push(`<!--[0-->${$.escape(row.original.reviewer)}`);
			} else {
				$$renderer.push('<!--[-1-->');

				Label($$renderer, {
					for: `${$.stringify(row.original.id)}-reviewer`,
					class: 'sr-only',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reviewer`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						get value() {
							return reviewer;
						},

						set value($$value) {
							reviewer = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									class: 'w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate',
									size: 'sm',
									id: `${$.stringify(row.original.id)}-reviewer`,
									children: ($$renderer) => {
										$$renderer.push(`<span data-slot="select-value">${$.escape(reviewer !== "" ? reviewer : "Assign reviewer")}</span>`);
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
									align: 'end',
									children: ($$renderer) => {
										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'Eddie Lake',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Eddie Lake`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'Jamik Tashpulatov',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Jamik Tashpulatov`);
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

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}