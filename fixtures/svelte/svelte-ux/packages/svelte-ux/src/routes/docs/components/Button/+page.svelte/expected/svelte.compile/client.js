import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiHome, mdiMagnify, mdiMenu, mdiTrashCan } from '@mdi/js';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import {
	Button,
	Field,
	SectionDivider,
	Tooltip,
	Toggle,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <div class="mt-2"><!> <!> <!> <!> <!> <!></div> <div class="mt-2"><!> <!> <!> <!> <!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><div class="font-semibold my-2"> </div> <div class="grid gap-2 ml-4"><div><!> <!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div></div></div></div>`);
var root_3 = $.from_html(`<div class="grid gap-3 divide-y"></div>`);
var root_4 = $.from_html(`<div class="grid gap-2"><div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div> <div><!> <!> <!> <!></div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-center"><!> <!> <!> <!> <!></div>`);
var root_7 = $.from_html(`<div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div>`, 1);
var root_8 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Link</h2> <!> <h2>Disabled</h2> <!> <h2>Loading</h2> <!> <div class="grid grid-cols-[1fr,auto] gap-2 items-end"><h2>Variants, Color & Size</h2> <!></div> <!> <h2>\`none\` variant</h2> <!> <h2>Rounded</h2> <!> <h2>Uppercase</h2> <!> <h2>Tooltip</h2> <!> <h2>Tooltip (disabled)</h2> <!> <h2>Text with icon</h2> <!> <h2>Pass props to Icon</h2> <!> <h2>Pass class to Icon</h2> <!> <!> <h2>Icon-only button</h2> <!> <h2>Icon-only size</h2> <!> <h2>Icon-only button with custom padding</h2> <!> <h2>Icon via url</h2> <!> <h2>Icon via SVG string</h2> <!> <h2>Icon-only button variants and color</h2> <!>`, 1);

export default function _page($$anchor) {
	let size = 'md';

	const variants = [
		'default',
		'outline',
		'fill',
		'fill-light',
		'fill-outline',
		'text'
	];

	var fragment = root_8();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				$$events: { click: () => alert('Why did you do that?') },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				href: 'https://www.google.com',
				target: '_blank',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Open Google');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Click me');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Button(node_4, {
				loading: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Loading...');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				variant: 'outline',
				color: 'primary',
				loading: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Loading...');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				variant: 'fill',
				color: 'primary',
				loading: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Loading...');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				variant: 'fill-light',
				color: 'primary',
				loading: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Loading...');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				variant: 'fill-outline',
				color: 'primary',
				loading: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Loading...');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				variant: 'text',
				color: 'primary',
				loading: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Loading...');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_9, 2);
			var node_10 = $.child(div);

			Toggle(node_10, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Click me');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Toggle(node_11, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							variant: 'outline',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Click me');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_12 = $.sibling(node_11, 2);

			Toggle(node_12, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							variant: 'fill',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text('Click me');

								$.append($$anchor, text_11);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_13 = $.sibling(node_12, 2);

			Toggle(node_13, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							variant: 'fill-light',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_12 = $.text('Click me');

								$.append($$anchor, text_12);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_14 = $.sibling(node_13, 2);

			Toggle(node_14, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							variant: 'fill-outline',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Click me');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_15 = $.sibling(node_14, 2);

			Toggle(node_15, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							variant: 'text',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_14 = $.text('Click me');

								$.append($$anchor, text_14);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_16 = $.child(div_1);

			Toggle(node_16, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get icon() {
								return faUser;
							},

							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_15 = $.text('Click me');

								$.append($$anchor, text_15);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_17 = $.sibling(node_16, 2);

			Toggle(node_17, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get icon() {
								return faUser;
							},
							variant: 'outline',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_16 = $.text('Click me');

								$.append($$anchor, text_16);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_18 = $.sibling(node_17, 2);

			Toggle(node_18, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get icon() {
								return faUser;
							},
							variant: 'fill',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_17 = $.text('Click me');

								$.append($$anchor, text_17);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_19 = $.sibling(node_18, 2);

			Toggle(node_19, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get icon() {
								return faUser;
							},
							variant: 'fill-light',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_18 = $.text('Click me');

								$.append($$anchor, text_18);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_20 = $.sibling(node_19, 2);

			Toggle(node_20, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get icon() {
								return faUser;
							},
							variant: 'fill-outline',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_19 = $.text('Click me');

								$.append($$anchor, text_19);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			var node_21 = $.sibling(node_20, 2);

			Toggle(node_21, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const loading = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);

						Button($$anchor, {
							get icon() {
								return faUser;
							},
							variant: 'text',
							color: 'primary',
							get loading() {
								return $.get(loading);
							},

							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_20 = $.text('Click me');

								$.append($$anchor, text_20);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$.reset(div_1);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_3, 2);
	var node_22 = $.sibling($.child(div_2), 2);

	Field(node_22, {
		label: 'size: ',
		labelPlacement: 'left',
		class: 'mb-1',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				size: 'sm',
				get value() {
					return size;
				},

				set value($$value) {
					size = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root_1();
					var node_23 = $.first_child(fragment_18);

					ToggleOption(node_23, {
						value: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('sm');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					ToggleOption(node_24, {
						value: 'md',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text('md');

							$.append($$anchor, text_22);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					ToggleOption(node_25, {
						value: 'lg',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text('lg');

							$.append($$anchor, text_23);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var node_26 = $.sibling(div_2, 2);

	Preview(node_26, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_3();

			$.each(div_3, 21, () => variants, $.index, ($$anchor, variant) => {
				var div_4 = root_2();
				var div_5 = $.child(div_4);
				var text_24 = $.only_child(div_5, true);
				var div_6 = $.sibling(div_5, 2);
				var div_7 = $.child(div_6);
				var node_27 = $.child(div_7);

				Button(node_27, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_25 = $.text('Default');

						$.append($$anchor, text_25);
					},
					$$slots: { default: true }
				});

				var node_28 = $.sibling(node_27, 2);

				Button(node_28, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'primary',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_26 = $.text('Primary');

						$.append($$anchor, text_26);
					},
					$$slots: { default: true }
				});

				var node_29 = $.sibling(node_28, 2);

				Button(node_29, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'secondary',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_27 = $.text('Secondary');

						$.append($$anchor, text_27);
					},
					$$slots: { default: true }
				});

				var node_30 = $.sibling(node_29, 2);

				Button(node_30, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'accent',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_28 = $.text('Accent');

						$.append($$anchor, text_28);
					},
					$$slots: { default: true }
				});

				var node_31 = $.sibling(node_30, 2);

				Button(node_31, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'neutral',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_29 = $.text('Neutral');

						$.append($$anchor, text_29);
					},
					$$slots: { default: true }
				});

				$.reset(div_7);

				var div_8 = $.sibling(div_7, 2);
				var node_32 = $.child(div_8);

				Button(node_32, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'info',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_30 = $.text('Info');

						$.append($$anchor, text_30);
					},
					$$slots: { default: true }
				});

				var node_33 = $.sibling(node_32, 2);

				Button(node_33, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'success',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_31 = $.text('Success');

						$.append($$anchor, text_31);
					},
					$$slots: { default: true }
				});

				var node_34 = $.sibling(node_33, 2);

				Button(node_34, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'warning',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_32 = $.text('Warning');

						$.append($$anchor, text_32);
					},
					$$slots: { default: true }
				});

				var node_35 = $.sibling(node_34, 2);

				Button(node_35, {
					get variant() {
						return $.get(variant);
					},

					get size() {
						return size;
					},
					color: 'danger',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_33 = $.text('Danger');

						$.append($$anchor, text_33);
					},
					$$slots: { default: true }
				});

				$.reset(div_8);
				$.next(2);
				$.reset(div_6);
				$.reset(div_4);
				$.template_effect(() => $.set_text(text_24, $.get(variant)));
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_26, 4);

	Preview(node_36, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				variant: 'none',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_34 = $.text('Click me');

					$.append($$anchor, text_34);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_37 = $.sibling(node_36, 4);

	Preview(node_37, {
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_4();
			var div_10 = $.child(div_9);
			var node_38 = $.child(div_10);

			Button(node_38, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_35 = $.text('default');

					$.append($$anchor, text_35);
				},
				$$slots: { default: true }
			});

			var node_39 = $.sibling(node_38, 2);

			Button(node_39, {
				rounded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_36 = $.text('rounded');

					$.append($$anchor, text_36);
				},
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_39, 2);

			Button(node_40, {
				rounded: 'full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_37 = $.text('full');

					$.append($$anchor, text_37);
				},
				$$slots: { default: true }
			});

			var node_41 = $.sibling(node_40, 2);

			Button(node_41, {
				rounded: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_38 = $.text('false');

					$.append($$anchor, text_38);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var node_42 = $.child(div_11);

			Button(node_42, {
				variant: 'outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_39 = $.text('default');

					$.append($$anchor, text_39);
				},
				$$slots: { default: true }
			});

			var node_43 = $.sibling(node_42, 2);

			Button(node_43, {
				variant: 'outline',
				color: 'primary',
				rounded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_40 = $.text('rounded');

					$.append($$anchor, text_40);
				},
				$$slots: { default: true }
			});

			var node_44 = $.sibling(node_43, 2);

			Button(node_44, {
				variant: 'outline',
				color: 'primary',
				rounded: 'full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_41 = $.text('full');

					$.append($$anchor, text_41);
				},
				$$slots: { default: true }
			});

			var node_45 = $.sibling(node_44, 2);

			Button(node_45, {
				variant: 'outline',
				color: 'primary',
				rounded: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_42 = $.text('false');

					$.append($$anchor, text_42);
				},
				$$slots: { default: true }
			});

			$.reset(div_11);

			var div_12 = $.sibling(div_11, 2);
			var node_46 = $.child(div_12);

			Button(node_46, {
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_43 = $.text('default');

					$.append($$anchor, text_43);
				},
				$$slots: { default: true }
			});

			var node_47 = $.sibling(node_46, 2);

			Button(node_47, {
				variant: 'fill',
				color: 'primary',
				rounded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_44 = $.text('rounded');

					$.append($$anchor, text_44);
				},
				$$slots: { default: true }
			});

			var node_48 = $.sibling(node_47, 2);

			Button(node_48, {
				variant: 'fill',
				color: 'primary',
				rounded: 'full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_45 = $.text('full');

					$.append($$anchor, text_45);
				},
				$$slots: { default: true }
			});

			var node_49 = $.sibling(node_48, 2);

			Button(node_49, {
				variant: 'fill',
				color: 'primary',
				rounded: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_46 = $.text('false');

					$.append($$anchor, text_46);
				},
				$$slots: { default: true }
			});

			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var node_50 = $.child(div_13);

			Button(node_50, {
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_47 = $.text('default');

					$.append($$anchor, text_47);
				},
				$$slots: { default: true }
			});

			var node_51 = $.sibling(node_50, 2);

			Button(node_51, {
				variant: 'fill-light',
				color: 'primary',
				rounded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_48 = $.text('rounded');

					$.append($$anchor, text_48);
				},
				$$slots: { default: true }
			});

			var node_52 = $.sibling(node_51, 2);

			Button(node_52, {
				variant: 'fill-light',
				color: 'primary',
				rounded: 'full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_49 = $.text('full');

					$.append($$anchor, text_49);
				},
				$$slots: { default: true }
			});

			var node_53 = $.sibling(node_52, 2);

			Button(node_53, {
				variant: 'fill-light',
				color: 'primary',
				rounded: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_50 = $.text('false');

					$.append($$anchor, text_50);
				},
				$$slots: { default: true }
			});

			$.reset(div_13);

			var div_14 = $.sibling(div_13, 2);
			var node_54 = $.child(div_14);

			Button(node_54, {
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_51 = $.text('default');

					$.append($$anchor, text_51);
				},
				$$slots: { default: true }
			});

			var node_55 = $.sibling(node_54, 2);

			Button(node_55, {
				variant: 'fill-outline',
				color: 'primary',
				rounded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_52 = $.text('rounded');

					$.append($$anchor, text_52);
				},
				$$slots: { default: true }
			});

			var node_56 = $.sibling(node_55, 2);

			Button(node_56, {
				variant: 'fill-outline',
				color: 'primary',
				rounded: 'full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_53 = $.text('full');

					$.append($$anchor, text_53);
				},
				$$slots: { default: true }
			});

			var node_57 = $.sibling(node_56, 2);

			Button(node_57, {
				variant: 'fill-outline',
				color: 'primary',
				rounded: false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_54 = $.text('false');

					$.append($$anchor, text_54);
				},
				$$slots: { default: true }
			});

			$.reset(div_14);
			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_58 = $.sibling(node_37, 4);

	Preview(node_58, {
		children: ($$anchor, $$slotProps) => {
			var fragment_20 = root_5();
			var node_59 = $.first_child(fragment_20);

			Button(node_59, {
				class: 'uppercase',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_55 = $.text('default');

					$.append($$anchor, text_55);
				},
				$$slots: { default: true }
			});

			var node_60 = $.sibling(node_59, 2);

			Button(node_60, {
				class: 'uppercase',
				variant: 'outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_56 = $.text('outline');

					$.append($$anchor, text_56);
				},
				$$slots: { default: true }
			});

			var node_61 = $.sibling(node_60, 2);

			Button(node_61, {
				class: 'uppercase',
				variant: 'fill',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_57 = $.text('fill');

					$.append($$anchor, text_57);
				},
				$$slots: { default: true }
			});

			var node_62 = $.sibling(node_61, 2);

			Button(node_62, {
				class: 'uppercase',
				variant: 'fill-light',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_58 = $.text('fill-light');

					$.append($$anchor, text_58);
				},
				$$slots: { default: true }
			});

			var node_63 = $.sibling(node_62, 2);

			Button(node_63, {
				class: 'uppercase',
				variant: 'fill-outline',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_59 = $.text('fill-outline');

					$.append($$anchor, text_59);
				},
				$$slots: { default: true }
			});

			var node_64 = $.sibling(node_63, 2);

			Button(node_64, {
				class: 'uppercase',
				variant: 'text',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_60 = $.text('text');

					$.append($$anchor, text_60);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_20);
		},
		$$slots: { default: true }
	});

	var node_65 = $.sibling(node_58, 4);

	Preview(node_65, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				title: 'Really, do it!',
				placement: 'right',
				offset: 2,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_61 = $.text('Click me');

							$.append($$anchor, text_61);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_66 = $.sibling(node_65, 4);

	Preview(node_66, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				title: 'Really, do it!',
				placement: 'right',
				offset: 2,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_62 = $.text('Click me');

							$.append($$anchor, text_62);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_67 = $.sibling(node_66, 4);

	Preview(node_67, {
		children: ($$anchor, $$slotProps) => {
			var div_15 = root_6();
			var node_68 = $.child(div_15);

			Button(node_68, {
				get icon() {
					return mdiTrashCan;
				},
				color: 'danger',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_63 = $.text('Delete');

					$.append($$anchor, text_63);
				},
				$$slots: { default: true }
			});

			var node_69 = $.sibling(node_68, 2);

			Button(node_69, {
				get icon() {
					return mdiMagnify;
				},
				class: 'flex-row-reverse',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_64 = $.text('Search');

					$.append($$anchor, text_64);
				},
				$$slots: { default: true }
			});

			var node_70 = $.sibling(node_69, 2);

			Button(node_70, {
				get icon() {
					return mdiHome;
				},
				class: 'flex-col',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_65 = $.text('Home');

					$.append($$anchor, text_65);
				},
				$$slots: { default: true }
			});

			var node_71 = $.sibling(node_70, 2);

			Button(node_71, {
				get icon() {
					return mdiHome;
				},
				class: 'flex-col-reverse',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_66 = $.text('Home');

					$.append($$anchor, text_66);
				},
				$$slots: { default: true }
			});

			var node_72 = $.sibling(node_71, 2);

			Button(node_72, {
				get icon() {
					return faUser;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_67 = $.text('Profile');

					$.append($$anchor, text_67);
				},
				$$slots: { default: true }
			});

			$.reset(div_15);
			$.append($$anchor, div_15);
		},
		$$slots: { default: true }
	});

	var node_73 = $.sibling(node_67, 4);

	Preview(node_73, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ data: mdiTrashCan, size: '2rem', style: 'color: crimson' }));

				Button($$anchor, {
					get icon() {
						return $.get($0);
					},
					color: 'danger',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_68 = $.text('Delete');

						$.append($$anchor, text_68);
					},
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_74 = $.sibling(node_73, 4);

	Preview(node_74, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				get icon() {
					return mdiTrashCan;
				},
				classes: { icon: 'text-danger-300 text-lg' },
				color: 'danger',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_69 = $.text('Delete');

					$.append($$anchor, text_69);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_75 = $.sibling(node_74, 2);

	SectionDivider(node_75, {
		class: 'mt-12',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_70 = $.text('Icon only');

			$.append($$anchor, text_70);
		},
		$$slots: { default: true }
	});

	var node_76 = $.sibling(node_75, 4);

	Preview(node_76, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				get icon() {
					return mdiMenu;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_77 = $.sibling(node_76, 4);

	Preview(node_77, {
		children: ($$anchor, $$slotProps) => {
			var fragment_28 = root_1();
			var node_78 = $.first_child(fragment_28);

			Button(node_78, {
				get icon() {
					return mdiMenu;
				},
				size: 'sm'
			});

			var node_79 = $.sibling(node_78, 2);

			Button(node_79, {
				get icon() {
					return mdiMenu;
				},
				size: 'md'
			});

			var node_80 = $.sibling(node_79, 2);

			Button(node_80, {
				get icon() {
					return mdiMenu;
				},
				size: 'lg'
			});

			$.append($$anchor, fragment_28);
		},
		$$slots: { default: true }
	});

	var node_81 = $.sibling(node_77, 4);

	Preview(node_81, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				get icon() {
					return mdiMenu;
				},
				class: 'p-2'
			});
		},
		$$slots: { default: true }
	});

	var node_82 = $.sibling(node_81, 4);

	Preview(node_82, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				icon: 'https://api.iconify.design/mdi:account.svg',
				class: 'p-2'
			});
		},
		$$slots: { default: true }
	});

	var node_83 = $.sibling(node_82, 4);

	Preview(node_83, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				icon: '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z"/></svg>',
				class: 'p-2'
			});
		},
		$$slots: { default: true }
	});

	var node_84 = $.sibling(node_83, 4);

	Preview(node_84, {
		children: ($$anchor, $$slotProps) => {
			var fragment_32 = root_7();
			var div_16 = $.first_child(fragment_32);
			var node_85 = $.child(div_16);

			Button(node_85, {
				get icon() {
					return mdiMenu;
				}
			});

			var node_86 = $.sibling(node_85, 2);

			Button(node_86, {
				get icon() {
					return mdiMenu;
				},
				color: 'primary'
			});

			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);
			var node_87 = $.child(div_17);

			Button(node_87, {
				get icon() {
					return mdiMenu;
				},
				variant: 'outline'
			});

			var node_88 = $.sibling(node_87, 2);

			Button(node_88, {
				get icon() {
					return mdiMenu;
				},
				variant: 'outline',
				color: 'primary'
			});

			$.reset(div_17);

			var div_18 = $.sibling(div_17, 2);
			var node_89 = $.child(div_18);

			Button(node_89, {
				get icon() {
					return mdiMenu;
				},
				variant: 'fill'
			});

			var node_90 = $.sibling(node_89, 2);

			Button(node_90, {
				get icon() {
					return mdiMenu;
				},
				variant: 'fill',
				color: 'primary'
			});

			$.reset(div_18);

			var div_19 = $.sibling(div_18, 2);
			var node_91 = $.child(div_19);

			Button(node_91, {
				get icon() {
					return mdiMenu;
				},
				variant: 'fill-light'
			});

			var node_92 = $.sibling(node_91, 2);

			Button(node_92, {
				get icon() {
					return mdiMenu;
				},
				variant: 'fill-light',
				color: 'primary'
			});

			$.reset(div_19);

			var div_20 = $.sibling(div_19, 2);
			var node_93 = $.child(div_20);

			Button(node_93, {
				get icon() {
					return mdiMenu;
				},
				variant: 'fill-outline'
			});

			var node_94 = $.sibling(node_93, 2);

			Button(node_94, {
				get icon() {
					return mdiMenu;
				},
				variant: 'fill-outline',
				color: 'primary'
			});

			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var node_95 = $.child(div_21);

			Button(node_95, {
				get icon() {
					return mdiMenu;
				},
				variant: 'text'
			});

			var node_96 = $.sibling(node_95, 2);

			Button(node_96, {
				get icon() {
					return mdiMenu;
				},
				variant: 'text',
				color: 'primary'
			});

			$.reset(div_21);
			$.append($$anchor, fragment_32);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}