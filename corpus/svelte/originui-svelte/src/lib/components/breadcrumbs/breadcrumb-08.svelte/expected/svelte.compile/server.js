import * as $ from 'svelte/internal/server';
import Database from '@lucide/svelte/icons/database';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';

export default function Breadcrumb_08($$renderer) {
	let value = 's1';

	const items = [
		{ label: 'Orion', value: 's1' },
		{ label: 'Sigma', value: 's2' },
		{ label: 'Dorado', value: 's3' }
	];

	const selectedItem = $.derived(() => items.find((item) => item.value === value));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Breadcrumb($$renderer, {
			children: ($$renderer) => {
				BreadcrumbList($$renderer, {
					children: ($$renderer) => {
						BreadcrumbItem($$renderer, {
							children: ($$renderer) => {
								BreadcrumbLink($$renderer, {
									href: '#',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Databases`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						BreadcrumbSeparator($$renderer, {});
						$$renderer.push(`<!----> `);

						BreadcrumbItem($$renderer, {
							children: ($$renderer) => {
								Select($$renderer, {
									type: 'single',
									allowDeselect: false,
									get value() {
										return value;
									},

									set value($$value) {
										value = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										SelectTrigger($$renderer, {
											id: 'select-database',
											class: 'relative ps-9',
											'aria-label': 'Select database',
											children: ($$renderer) => {
												$$renderer.push(`<div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50">`);
												Database($$renderer, { size: 16, 'aria-hidden': 'true' });
												$$renderer.push(`<!----></div> ${$.escape(selectedItem()?.label ?? 'Select database')}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										SelectContent($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(items);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let item = each_array[$$index];

													SelectItem($$renderer, {
														value: item.value,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(item.label)}`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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
}