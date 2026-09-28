import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-y-10"><header><h2 class="h2">Progress Linear</h2></header> <section class="space-y-4"><!></section> <section class="space-y-4"><h2 class="h2">Colors</h2> <!> <!> <!></section> <section class="space-y-4"><h2 class="h2">Height</h2> <!> <!> <!></section> <section class="space-y-4"><h3 class="h3">Orientation</h3> <div class="flex flex-row items-start gap-4"><!> <!></div></section> <section class="space-y-4"><h3 class="h3">Labeled</h3> <!></section> <section class="space-y-4"><h3 class="h3">Indeterminate</h3> <!></section></div>`);

export default function _page($$anchor) {
	let value = 25;
	var div = root_1();
	var section = $.sibling($.child(div), 2);
	var node = $.child(section);

	Progress(node, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Progress.Track, ($$anchor, Progress_Track) => {
				Progress_Track($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Progress.Range, ($$anchor, Progress_Range) => {
							Progress_Range($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_3 = $.sibling($.child(section_1), 2);

	Progress(node_3, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => Progress.Track, ($$anchor, Progress_Track_1) => {
				Progress_Track_1($$anchor, {
					class: 'bg-primary-50-950',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => Progress.Range, ($$anchor, Progress_Range_1) => {
							Progress_Range_1($$anchor, { class: 'bg-primary-500' });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Progress(node_6, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_7 = $.first_child(fragment_4);

			$.component(node_7, () => Progress.Track, ($$anchor, Progress_Track_2) => {
				Progress_Track_2($$anchor, {
					class: 'bg-secondary-50-950',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_8 = $.first_child(fragment_5);

						$.component(node_8, () => Progress.Range, ($$anchor, Progress_Range_2) => {
							Progress_Range_2($$anchor, { class: 'bg-secondary-500' });
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	Progress(node_9, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_10 = $.first_child(fragment_6);

			$.component(node_10, () => Progress.Track, ($$anchor, Progress_Track_3) => {
				Progress_Track_3($$anchor, {
					class: 'bg-tertiary-50-950',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = $.comment();
						var node_11 = $.first_child(fragment_7);

						$.component(node_11, () => Progress.Range, ($$anchor, Progress_Range_3) => {
							Progress_Range_3($$anchor, { class: 'bg-tertiary-500' });
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_12 = $.sibling($.child(section_2), 2);

	Progress(node_12, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = $.comment();
			var node_13 = $.first_child(fragment_8);

			$.component(node_13, () => Progress.Track, ($$anchor, Progress_Track_4) => {
				Progress_Track_4($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = $.comment();
						var node_14 = $.first_child(fragment_9);

						$.component(node_14, () => Progress.Range, ($$anchor, Progress_Range_4) => {
							Progress_Range_4($$anchor, {});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_12, 2);

	Progress(node_15, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = $.comment();
			var node_16 = $.first_child(fragment_10);

			$.component(node_16, () => Progress.Track, ($$anchor, Progress_Track_5) => {
				Progress_Track_5($$anchor, {
					class: 'h-4 rounded-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = $.comment();
						var node_17 = $.first_child(fragment_11);

						$.component(node_17, () => Progress.Range, ($$anchor, Progress_Range_5) => {
							Progress_Range_5($$anchor, { class: 'rounded-full' });
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_15, 2);

	Progress(node_18, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = $.comment();
			var node_19 = $.first_child(fragment_12);

			$.component(node_19, () => Progress.Track, ($$anchor, Progress_Track_6) => {
				Progress_Track_6($$anchor, {
					class: 'h-8 rounded-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = $.comment();
						var node_20 = $.first_child(fragment_13);

						$.component(node_20, () => Progress.Range, ($$anchor, Progress_Range_6) => {
							Progress_Range_6($$anchor, { class: 'rounded-full' });
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var div_1 = $.sibling($.child(section_3), 2);
	var node_21 = $.child(div_1);

	Progress(node_21, {
		orientation: 'vertical',
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root();
			var node_22 = $.first_child(fragment_14);

			$.component(node_22, () => Progress.Label, ($$anchor, Progress_Label) => {
				Progress_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_15 = $.comment();
						var node_23 = $.first_child(fragment_15);

						$.component(node_23, () => Progress.ValueText, ($$anchor, Progress_ValueText) => {
							Progress_ValueText($$anchor, {});
						});

						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});
			});

			var node_24 = $.sibling(node_22, 2);

			$.component(node_24, () => Progress.Track, ($$anchor, Progress_Track_7) => {
				Progress_Track_7($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_16 = $.comment();
						var node_25 = $.first_child(fragment_16);

						$.component(node_25, () => Progress.Range, ($$anchor, Progress_Range_7) => {
							Progress_Range_7($$anchor, {});
						});

						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	var node_26 = $.sibling(node_21, 2);

	Progress(node_26, {
		orientation: 'vertical',
		value: null,
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root();
			var node_27 = $.first_child(fragment_17);

			$.component(node_27, () => Progress.Label, ($$anchor, Progress_Label_1) => {
				Progress_Label_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('null');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_28 = $.sibling(node_27, 2);

			$.component(node_28, () => Progress.Track, ($$anchor, Progress_Track_8) => {
				Progress_Track_8($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_18 = $.comment();
						var node_29 = $.first_child(fragment_18);

						$.component(node_29, () => Progress.Range, ($$anchor, Progress_Range_8) => {
							Progress_Range_8($$anchor, {});
						});

						$.append($$anchor, fragment_18);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var node_30 = $.sibling($.child(section_4), 2);

	Progress(node_30, {
		value,
		children: ($$anchor, $$slotProps) => {
			var fragment_19 = root();
			var node_31 = $.first_child(fragment_19);

			$.component(node_31, () => Progress.Label, ($$anchor, Progress_Label_2) => {
				Progress_Label_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_20 = $.comment();
						var node_32 = $.first_child(fragment_20);

						$.component(node_32, () => Progress.ValueText, ($$anchor, Progress_ValueText_1) => {
							Progress_ValueText_1($$anchor, {});
						});

						$.append($$anchor, fragment_20);
					},
					$$slots: { default: true }
				});
			});

			var node_33 = $.sibling(node_31, 2);

			$.component(node_33, () => Progress.Track, ($$anchor, Progress_Track_9) => {
				Progress_Track_9($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_21 = $.comment();
						var node_34 = $.first_child(fragment_21);

						$.component(node_34, () => Progress.Range, ($$anchor, Progress_Range_9) => {
							Progress_Range_9($$anchor, {});
						});

						$.append($$anchor, fragment_21);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_19);
		},
		$$slots: { default: true }
	});

	$.reset(section_4);

	var section_5 = $.sibling(section_4, 2);
	var node_35 = $.sibling($.child(section_5), 2);

	Progress(node_35, {
		value: null,
		children: ($$anchor, $$slotProps) => {
			var fragment_22 = $.comment();
			var node_36 = $.first_child(fragment_22);

			$.component(node_36, () => Progress.Track, ($$anchor, Progress_Track_10) => {
				Progress_Track_10($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_23 = $.comment();
						var node_37 = $.first_child(fragment_23);

						$.component(node_37, () => Progress.Range, ($$anchor, Progress_Range_10) => {
							Progress_Range_10($$anchor, {});
						});

						$.append($$anchor, fragment_23);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_22);
		},
		$$slots: { default: true }
	});

	$.reset(section_5);
	$.reset(div);
	$.append($$anchor, div);
}