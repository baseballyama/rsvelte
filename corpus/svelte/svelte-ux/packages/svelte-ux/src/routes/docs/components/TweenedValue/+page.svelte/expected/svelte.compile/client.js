import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as easings from 'svelte/easing';
import { Button, ButtonGroup, Kbd, TweenedValue, getSettings } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<h1>Examples</h1> <div class="grid grid-cols-[1fr,auto,auto] gap-2"><!> <!> <!></div> <div class="text-xs mt-1 ml-2 text-surface-content/50">Keyboard: <!> <!> +/- 1. With <!> +/- 10. With <!>: +/- 100</div> <h2>Basic</h2> <!> <h2>Formatted</h2> <!> <h2>Options</h2> <!> <h2>Style</h2> <!> <h2>Disabled</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $format = () => $.store_get(format, '$format', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { format } = getSettings();
	let value = 0;

	function onKeyDown(e) {
		const step = e.shiftKey ? 10 : e.altKey ? 100 : 1;

		switch (e.code) {
			case 'ArrowUp':
				increment(step);
				e.preventDefault();
				break;

			case 'ArrowDown':
				increment(-step);
				e.preventDefault();
				break;
		}
	}

	function increment(newValue) {
		value = (value ?? 0) + newValue;
	}

	var fragment = root_2();

	$.event('keydown', $.window, onKeyDown);

	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	ButtonGroup(node, {
		variant: 'fill-light',
		class: 'grid grid-flow-col ml-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				$$events: { click: () => increment(-100) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('-100');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				$$events: { click: () => increment(-10) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('-10');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				$$events: { click: () => increment(-1) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('-1');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				$$events: { click: () => value = 0 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('0');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				$$events: { click: () => increment(1) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('+1');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				$$events: { click: () => increment(10) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('+10');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				$$events: { click: () => increment(100) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('+100');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	Button(node_8, {
		variant: 'fill-light',
		$$events: { click: () => value = Math.random() * 10 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Random');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Button(node_9, {
		variant: 'fill-light',
		$$events: { click: () => value = null },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Null');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_10 = $.sibling($.child(div_1));

	Kbd(node_10, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('↑');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Kbd(node_11, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('↓');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Kbd(node_12, {
		shift: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('shift');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Kbd(node_13, {
		option: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('option');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_1);

	var node_14 = $.sibling(div_1, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			TweenedValue($$anchor, {
				get value() {
					return value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			TweenedValue($$anchor, {
				get value() {
					return value;
				},
				format: 'decimal'
			});
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ duration: 1000, easing: easings.expoOut }));

				TweenedValue($$anchor, {
					get value() {
						return value;
					},
					format: 'decimal',
					get options() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			TweenedValue($$anchor, {
				get value() {
					return value;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);
						var span = root_1();
						var text_13 = $.only_child(span, true);

						$.template_effect(
							($0, $1) => {
								$.set_class(span, 1, $0);
								$.set_text(text_13, $1);
							},
							[
								() => $.clsx(cls('tabular-nums', ($.get(value) ?? 0) < 0 ? 'text-danger' : 'text-success')),
								() => $format()($.get(value), 'decimal')
							]
						);

						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			TweenedValue($$anchor, {
				get value() {
					return value;
				},
				disabled: true
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}