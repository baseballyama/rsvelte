import * as $ from 'svelte/internal/server';
import Check from '@lucide/svelte/icons/check';
import Monitor from '@lucide/svelte/icons/monitor';
import Smartphone from '@lucide/svelte/icons/smartphone';
import X from '@lucide/svelte/icons/x';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';

export default function Table_11($$renderer) {
	const items = [
		{
			desktop: [
				{ name: 'Chrome', supported: true, version: '115' },
				{ name: 'Edge', supported: true, version: '115' },
				{ name: 'Firefox', supported: false, version: '111' },
				{ name: 'Opera', supported: true, version: '101' },
				{ name: 'Safari', supported: false, version: 'No' }
			],
			feature: 'scroll-timeline',
			mobile: [
				{ name: 'Chrome Android', supported: true, version: '115' },
				{ name: 'Firefox Android', supported: false, version: 'No' },
				{ name: 'Opera Android', supported: true, version: '77' },
				{ name: 'Safari iOS', supported: false, version: 'No' },
				{ name: 'Samsung Internet', supported: true, version: '23' }
			]
		},

		{
			desktop: [
				{ name: 'Chrome', supported: true, version: '115' },
				{ name: 'Edge', supported: true, version: '115' },
				{ name: 'Firefox', supported: false, version: '114' },
				{ name: 'Opera', supported: true, version: '101' },
				{ name: 'Safari', supported: false, version: 'No' }
			],
			feature: 'view-timeline',
			mobile: [
				{ name: 'Chrome Android', supported: true, version: '115' },
				{ name: 'Firefox Android', supported: false, version: 'No' },
				{ name: 'Opera Android', supported: true, version: '77' },
				{ name: 'Safari iOS', supported: false, version: 'No' },
				{ name: 'Samsung Internet', supported: true, version: '23' }
			]
		},

		{
			desktop: [
				{ name: 'Chrome', supported: true, version: '127' },
				{ name: 'Edge', supported: true, version: '127' },
				{ name: 'Firefox', supported: false, version: '3' },
				{ name: 'Opera', supported: true, version: '113' },
				{ name: 'Safari', supported: true, version: '16.4' }
			],
			feature: 'font-size-adjust',
			mobile: [
				{ name: 'Chrome Android', supported: true, version: '127' },
				{ name: 'Firefox Android', supported: true, version: '4' },
				{ name: 'Opera Android', supported: true, version: '84' },
				{ name: 'Safari iOS', supported: true, version: '16.4' },
				{ name: 'Samsung Internet', supported: false, version: 'No' }
			]
		}
	];

	Table($$renderer, {
		children: ($$renderer) => {
			TableHeader($$renderer, {
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: '*:border-border border-y-0 hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {});
							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'border-b text-center',
								colspan: 5,
								children: ($$renderer) => {
									Monitor($$renderer, { class: 'inline-flex', size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span class="sr-only">Desktop browsers</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TableHead($$renderer, {
								class: 'border-b text-center',
								colspan: 5,
								children: ($$renderer) => {
									Smartphone($$renderer, { class: 'inline-flex', size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span class="sr-only">Mobile browsers</span>`);
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

			$$renderer.push(`<!----> `);

			TableHeader($$renderer, {
				children: ($$renderer) => {
					TableRow($$renderer, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$renderer) => {
							TableCell($$renderer, {});
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(items[0].desktop);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let browser = each_array[$$index];

								TableHead($$renderer, {
									class: 'text-foreground h-auto py-3 align-bottom',
									children: ($$renderer) => {
										$$renderer.push(`<span class="relative left-[calc(50%-.5rem)] block rotate-180 leading-4 whitespace-nowrap [text-orientation:sideways] [writing-mode:vertical-rl]">${$.escape(browser.name)}</span>`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]--> <!--[-->`);

							const each_array_1 = $.ensure_array_like(items[0].mobile);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let browser = each_array_1[$$index_1];

								TableHead($$renderer, {
									class: 'text-foreground h-auto py-3 align-bottom',
									children: ($$renderer) => {
										$$renderer.push(`<span class="relative left-[calc(50%-.5rem)] block rotate-180 leading-4 whitespace-nowrap [text-orientation:sideways] [writing-mode:vertical-rl]">${$.escape(browser.name)}</span>`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TableBody($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_2 = $.ensure_array_like(items);

					for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
						let item = each_array_2[$$index_3];

						TableRow($$renderer, {
							class: '*:border-border [&>:not(:last-child)]:border-r',
							children: ($$renderer) => {
								TableHead($$renderer, {
									class: 'text-foreground font-medium',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(item.feature)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <!--[-->`);

								const each_array_3 = $.ensure_array_like([...item.desktop, ...item.mobile]);

								for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
									let browser = each_array_3[index];

									TableCell($$renderer, {
										class: 'space-y-1 text-center',
										children: ($$renderer) => {
											if (browser.supported) {
												$$renderer.push('<!--[0-->');

												Check($$renderer, {
													class: 'inline-flex stroke-emerald-600',
													size: 16,
													'aria-hidden': 'true'
												});
											} else {
												$$renderer.push('<!--[-1-->');

												X($$renderer, {
													class: 'inline-flex stroke-red-600',
													size: 16,
													'aria-hidden': 'true'
												});
											}

											$$renderer.push(`<!--]--> <span class="sr-only">${$.escape(browser.supported ? 'Supported' : 'Not supported')}</span> <div class="text-muted-foreground text-xs font-medium">${$.escape(browser.version)}</div>`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
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
}