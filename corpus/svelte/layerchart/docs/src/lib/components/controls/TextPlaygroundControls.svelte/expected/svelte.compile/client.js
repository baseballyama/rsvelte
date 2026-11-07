import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Field,
	RangeField,
	Switch,
	TextField,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import { Text } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2 mb-2 screenshot-hidden"><!> <div class="grid grid-cols-[1fr_1fr_1fr] gap-2"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <div></div> <!></div></div>`);

export default function TextPlaygroundControls($$anchor, $$props) {
	$.push($$props, true);

	let config = $.prop($$props, 'config', 31, () => $.proxy({
		x: 0,
		y: 0,
		value: 'This is really long text',
		width: 300,
		textAnchor: 'start',
		verticalAnchor: 'start',
		lineHeight: '1em',
		rotate: 0,
		scaleToFit: false,
		showAnchor: true,
		resizeSvg: true,
		truncate: false,
		truncateOptions: { maxChars: 22, minChars: 0, ellipsis: '…', position: 'end' }
	}));

	var div = root_1();
	var node = $.child(div);

	TextField(node, {
		label: 'value',
		get value() {
			return config().value;
		},

		set value($$value) {
			config(config().value = $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	RangeField(node_1, {
		label: 'x',
		min: -300,
		max: 300,
		get value() {
			return config().x;
		},

		set value($$value) {
			config(config().x = $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'y',
		min: -300,
		max: 300,
		get value() {
			return config().y;
		},

		set value($$value) {
			config(config().y = $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	RangeField(node_3, {
		label: 'width',
		max: 300,
		get value() {
			return config().width;
		},

		set value($$value) {
			config(config().width = $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'rotate',
		max: 720,
		get value() {
			return config().rotate;
		},

		set value($$value) {
			config(config().rotate = $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'textAnchor',
		classes: { input: 'mt-[6px] mb-1' },
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().textAnchor;
				},

				set value($$value) {
					config(config().textAnchor = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_6 = $.first_child(fragment_1);

					ToggleOption(node_6, {
						value: 'start',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('start');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					ToggleOption(node_7, {
						value: 'middle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('middle');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					ToggleOption(node_8, {
						value: 'end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('end');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_5, 2);

	Field(node_9, {
		label: 'verticalAnchor',
		classes: { input: 'mt-[6px] mb-1' },
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return config().verticalAnchor;
				},

				set value($$value) {
					config(config().verticalAnchor = $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_10 = $.first_child(fragment_3);

					ToggleOption(node_10, {
						value: 'start',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('start');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					ToggleOption(node_11, {
						value: 'middle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('middle');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					ToggleOption(node_12, {
						value: 'end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('end');

							$.append($$anchor, text_5);
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

	var node_13 = $.sibling(node_9, 2);

	TextField(node_13, {
		label: 'lineHeight',
		get value() {
			return config().lineHeight;
		},

		set value($$value) {
			config(config().lineHeight = $$value, true);
		}
	});

	var node_14 = $.sibling(node_13, 2);

	Field(node_14, {
		label: 'scaleToFit',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return config().scaleToFit;
					},

					set checked($$value) {
						config(config().scaleToFit = $$value, true);
					}
				});
			}
		}
	});

	var node_15 = $.sibling(node_14, 2);

	Field(node_15, {
		label: 'resize svg (container)',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return config().resizeSvg;
					},

					set checked($$value) {
						config(config().resizeSvg = $$value, true);
					}
				});
			}
		}
	});

	var node_16 = $.sibling(node_15, 2);

	Field(node_16, {
		label: 'showAnchor',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return config().showAnchor;
					},

					set checked($$value) {
						config(config().showAnchor = $$value, true);
					}
				});
			}
		}
	});

	var node_17 = $.sibling(node_16, 2);

	Field(node_17, {
		label: 'truncate text',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},

					get checked() {
						return config().truncate;
					},

					set checked($$value) {
						config(config().truncate = $$value, true);
					}
				});
			}
		}
	});

	var node_18 = $.sibling(node_17, 4);

	{
		var consequent = ($$anchor) => {
			var fragment_8 = root();
			var node_19 = $.first_child(fragment_8);

			RangeField(node_19, {
				label: 'maxChars',
				min: 0,
				get max() {
					return config().value.length;
				},

				get value() {
					return config().truncateOptions.maxChars;
				},

				set value($$value) {
					config(config().truncateOptions.maxChars = $$value, true);
				}
			});

			var node_20 = $.sibling(node_19, 2);

			Field(node_20, {
				label: 'position',
				classes: { input: 'mt-[6px] mb-1' },
				children: ($$anchor, $$slotProps) => {
					ToggleGroup($$anchor, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return config().truncateOptions.position;
						},

						set value($$value) {
							config(config().truncateOptions.position = $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_21 = $.first_child(fragment_10);

							ToggleOption(node_21, {
								value: 'start',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('start');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_22 = $.sibling(node_21, 2);

							ToggleOption(node_22, {
								value: 'middle',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('middle');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							ToggleOption(node_23, {
								value: 'end',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('end');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_24 = $.sibling(node_20, 2);

			TextField(node_24, {
				label: 'ellipsis',
				get value() {
					return config().truncateOptions.ellipsis;
				},

				set value($$value) {
					config(config().truncateOptions.ellipsis = $$value, true);
				}
			});

			$.append($$anchor, fragment_8);
		};

		$.if(node_18, ($$render) => {
			if (config().truncate) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}