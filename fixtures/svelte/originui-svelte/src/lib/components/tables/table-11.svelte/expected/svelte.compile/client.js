import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span class="sr-only">Desktop browsers</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Mobile browsers</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="relative left-[calc(50%-.5rem)] block rotate-180 leading-4 whitespace-nowrap [text-orientation:sideways] [writing-mode:vertical-rl]"> </span>`);
var root_4 = $.from_html(`<!> <span class="sr-only"> </span> <div class="text-muted-foreground text-xs font-medium"> </div>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Table_11($$anchor) {
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

	Table($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			TableHeader(node, {
				children: ($$anchor, $$slotProps) => {
					TableRow($$anchor, {
						class: '*:border-border border-y-0 hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_1 = $.first_child(fragment_3);

							TableCell(node_1, {});

							var node_2 = $.sibling(node_1, 2);

							TableHead(node_2, {
								class: 'border-b text-center',
								colspan: 5,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									Monitor(node_3, { class: 'inline-flex', size: 16, 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_2, 2);

							TableHead(node_4, {
								class: 'border-b text-center',
								colspan: 5,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_5 = $.first_child(fragment_5);

									Smartphone(node_5, { class: 'inline-flex', size: 16, 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node, 2);

			TableHeader(node_6, {
				children: ($$anchor, $$slotProps) => {
					TableRow($$anchor, {
						class: '*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_2();
							var node_7 = $.first_child(fragment_7);

							TableCell(node_7, {});

							var node_8 = $.sibling(node_7, 2);

							$.each(node_8, 17, () => items[0].desktop, (browser) => browser.name, ($$anchor, browser) => {
								TableHead($$anchor, {
									class: 'text-foreground h-auto py-3 align-bottom',
									children: ($$anchor, $$slotProps) => {
										var span = root_3();
										var text = $.only_child(span, true);

										$.template_effect(() => $.set_text(text, $.get(browser).name));
										$.append($$anchor, span);
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.each(node_9, 17, () => items[0].mobile, (browser) => browser.name, ($$anchor, browser) => {
								TableHead($$anchor, {
									class: 'text-foreground h-auto py-3 align-bottom',
									children: ($$anchor, $$slotProps) => {
										var span_1 = root_3();
										var text_1 = $.only_child(span_1, true);

										$.template_effect(() => $.set_text(text_1, $.get(browser).name));
										$.append($$anchor, span_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_6, 2);

			TableBody(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = $.comment();
					var node_11 = $.first_child(fragment_10);

					$.each(node_11, 17, () => items, (item) => item.feature, ($$anchor, item) => {
						TableRow($$anchor, {
							class: '*:border-border [&>:not(:last-child)]:border-r',
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_5();
								var node_12 = $.first_child(fragment_12);

								TableHead(node_12, {
									class: 'text-foreground font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(item).feature));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								var node_13 = $.sibling(node_12, 2);

								$.each(node_13, 19, () => [...$.get(item).desktop, ...$.get(item).mobile], (browser, index) => `${browser.name}-${index}`, ($$anchor, browser) => {
									TableCell($$anchor, {
										class: 'space-y-1 text-center',
										children: ($$anchor, $$slotProps) => {
											var fragment_15 = root_4();
											var node_14 = $.first_child(fragment_15);

											{
												var consequent = ($$anchor) => {
													Check($$anchor, {
														class: 'inline-flex stroke-emerald-600',
														size: 16,
														'aria-hidden': 'true'
													});
												};

												var alternate = ($$anchor) => {
													X($$anchor, {
														class: 'inline-flex stroke-red-600',
														size: 16,
														'aria-hidden': 'true'
													});
												};

												$.if(node_14, ($$render) => {
													if ($.get(browser).supported) $$render(consequent); else $$render(alternate, -1);
												});
											}

											var span_2 = $.sibling(node_14, 2);
											var text_3 = $.only_child(span_2, true);
											var div = $.sibling(span_2, 2);
											var text_4 = $.only_child(div, true);

											$.template_effect(() => {
												$.set_text(text_3, $.get(browser).supported ? 'Supported' : 'Not supported');
												$.set_text(text_4, $.get(browser).version);
											});

											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}