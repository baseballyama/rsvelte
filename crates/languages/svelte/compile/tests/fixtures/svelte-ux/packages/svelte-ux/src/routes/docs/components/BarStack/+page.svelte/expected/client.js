import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarStack, Button, Tooltip, TweenedValue } from 'svelte-ux';
import { format, randomInteger } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="bar" class="flex items-center gap-2 truncate py-1 px-2 text-gray-900"><span class="text-sm font-semibold"> </span> <span class="text-xs truncate"> </span></div>`);
var root_1 = $.from_html(`<div></div> <div class="truncate text-xs font-semibold text-surface-content"> </div>`, 1);
var root_2 = $.from_html(`<div><div class="flex items-center gap-1 truncate py-1 px-2"><span class="text-sm font-semibold text-gray-900"><!></span> <span class="truncate text-xs text-gray-900"><!></span></div></div> <div class="truncate text-xs font-semibold text-surface-content"> </div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Larger gap</h2> <!> <h2>Color via prop</h2> <!> <h2>Bar slot</h2> <!> <h2>Label using default slot</h2> <!> <h2>Label with Tooltip</h2> <!> <h2>Tweened values</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ label: 'Chrome', value: 65, classes: { bar: 'bg-warning' } },
		{ label: 'Safari', value: 18.55, classes: { bar: 'bg-info' } },
		{ label: 'Edge', value: 5.03, classes: { bar: 'bg-success' } },
		{ label: 'Firefox', value: 2.8, classes: { bar: 'bg-danger' } }
	];

	const dataWithColorProp = [
		{ label: 'Chrome', value: 65, color: 'yellow' },
		{ label: 'Safari', value: 18.55, color: 'blue' },
		{ label: 'Edge', value: 5.03, color: 'green' },
		{ label: 'Firefox', value: 2.8, color: 'red' }
	];

	function randomDataGen() {
		return data.map((d) => {
			return { ...d, value: randomInteger(3, 70) };
		});
	}

	let randomData = randomDataGen();
	let duration = 300;
	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			BarStack($$anchor, {
				get data() {
					return data;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			BarStack($$anchor, {
				get data() {
					return data;
				},
				class: 'gap-1'
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			BarStack($$anchor, {
				get data() {
					return dataWithColorProp;
				},
				class: 'gap-1'
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			BarStack($$anchor, {
				get data() {
					return data;
				},

				$$slots: {
					bar: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						const total = $.derived(() => $$slotProps.total);
						var div = root();
						var span = $.child(div);
						var text = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_1 = $.only_child(span_1);

						$.reset(div);

						$.template_effect(
							($0, $1) => {
								$.set_text(text, $0);
								$.set_text(text_1, `(${$1 ?? ''})`);
							},
							[
								() => format($.get(item).value / $.get(total), 'percent'),
								() => format($.get(item).value, 'integer')
							]
						);

						$.append($$anchor, div);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			BarStack($$anchor, {
				get data() {
					return data;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						const total = $.derived(() => $$slotProps.total);
						var fragment_6 = root_1();
						var div_1 = $.first_child(fragment_6);
						var div_2 = $.sibling(div_1, 2);
						var text_2 = $.only_child(div_2, true);

						$.template_effect(
							($0) => {
								$.set_class(div_1, 1, $0);
								$.set_text(text_2, $.get(item).label);
							},
							[
								() => $.clsx(cls('h-1 group-first:rounded-l group-last:rounded-r', $.get(item).classes?.bar))
							]
						);

						$.append($$anchor, fragment_6);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			BarStack($$anchor, {
				get data() {
					return data;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						const total = $.derived(() => $$slotProps.total);

						{
							let $0 = $.derived(() => $.get(item).label);
							let $1 = $.derived(() => format($.get(item).value / $.get(total), 'percent'));
							let $2 = $.derived(() => format($.get(item).value, 'integer'));

							Tooltip($$anchor, {
								get title() {
									return `${$.get($0) ?? ''}: ${$.get($1) ?? ''} (${$.get($2) ?? ''})`;
								},
								placement: 'bottom-start',
								offset: 2,
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var div_3 = $.first_child(fragment_9);
									var div_4 = $.sibling(div_3, 2);
									var text_3 = $.only_child(div_4, true);

									$.template_effect(
										($0) => {
											$.set_class(div_3, 1, $0);
											$.set_text(text_3, $.get(item).label);
										},
										[
											() => $.clsx(cls('h-1 group-first:rounded-l group-last:rounded-r', $.get(item).classes?.bar))
										]
									);

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_3();
			var node_7 = $.first_child(fragment_10);

			Button(node_7, {
				variant: 'outline',
				color: 'primary',
				class: 'mb-2',
				size: 'sm',
				$$events: { click: () => randomData = randomDataGen() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Randomize');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			BarStack(node_8, {
				get data() {
					return randomData;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const item = $.derived(() => $$slotProps.item);
						const total = $.derived(() => $$slotProps.total);
						var fragment_11 = root_2();
						var div_5 = $.first_child(fragment_11);
						var div_6 = $.child(div_5);
						var span_2 = $.child(div_6);
						var node_9 = $.child(span_2);

						{
							let $0 = $.derived(() => $.get(item).value / $.get(total));

							TweenedValue(node_9, {
								get value() {
									return $.get($0);
								},
								options: { duration },
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const value = $.derived(() => $$slotProps.value);

										$.next();

										var text_5 = $.text();

										$.template_effect(($0) => $.set_text(text_5, $0), [() => format($.get(value) ?? 0, 'percent')]);
										$.append($$anchor, text_5);
									}
								}
							});
						}

						$.reset(span_2);

						var span_3 = $.sibling(span_2, 2);
						var node_10 = $.child(span_3);

						TweenedValue(node_10, {
							get value() {
								return $.get(item).value;
							},
							options: { duration },
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const value = $.derived(() => $$slotProps.value);

									$.next();

									var text_6 = $.text();

									$.template_effect(($0) => $.set_text(text_6, `(${$0 ?? ''})`), [() => format($.get(value) ?? 0, 'integer')]);
									$.append($$anchor, text_6);
								}
							}
						});

						$.reset(span_3);
						$.reset(div_6);
						$.reset(div_5);

						var div_7 = $.sibling(div_5, 2);
						var text_7 = $.only_child(div_7, true);

						$.template_effect(
							($0) => {
								$.set_class(div_5, 1, $0);
								$.set_text(text_7, $.get(item).label);
							},
							[
								() => $.clsx(cls('group-first:rounded-l group-last:rounded-r', $.get(item).classes?.bar))
							]
						);

						$.append($$anchor, fragment_11);
					}
				}
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}