import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import Code from '../code/code.svelte';
import DecorStripes from '../layout/decor-stripes.svelte';
import CopyIcon from '@lucide/svelte/icons/copy';
import LockIcon from '@lucide/svelte/icons/lock';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';
import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<span class="badge preset-tonal">Preview</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="vr"></span> <button type="button" class="btn-icon preset-outlined-surface-200-800 hover:preset-tonal" title="Copy Code" aria-label="Copy Code"><!></button>`, 1);
var root_4 = $.from_html(`<a class="btn preset-tonal"><!> <span>Unlock Block</span></a>`);
var root_5 = $.from_html(`<div class="space-y-4"><header class="flex justify-between items-center gap-4"><div class="flex items-center gap-2"><h2 class="text-xl font-medium"> </h2> <!></div> <div class="flex items-center gap-2"><!> <span class="vr hidden md:inline-block"></span> <!></div></header> <!></div>`);

export default function Preview($$anchor, $$props) {
	$.push($$props, true);

	const title = $.prop($$props, 'title', 3, '(Title Missing)'),
		code = $.prop($$props, 'code', 3, '(Code Missing)'),
		locked = $.prop($$props, 'locked', 3, false);

	let view = $.state('preview');
	let mode = $.state(null);
	let copied = $.state(false);

	// Default OS preference, keep in sync with OS changes.
	$.user_effect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');

		$.set(mode, mq.matches ? 'dark' : 'light', true);

		const handler = (e) => $.set(mode, e.matches ? 'dark' : 'light', true);

		mq.addEventListener('change', handler);

		return () => mq.removeEventListener('change', handler);
	});

	$.user_effect(() => {
		if (!$.get(copied)) return;

		const timeout = setTimeout(() => $.set(copied, false), 2000);

		return () => clearTimeout(timeout);
	});

	async function copyCode() {
		if (!code()) return;

		await navigator.clipboard.writeText(code());
		$.set(copied, true);
	}

	var div = root_5();
	var header = $.child(div);
	var div_1 = $.child(header);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var node = $.sibling(h2, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (locked()) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	SegmentedControl(node_1, {
		get value() {
			return $.get(mode);
		},
		onValueChange: (details) => $.set(mode, details.value ?? 'light', true),
		class: 'hidden md:block',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
				SegmentedControl_Control($$anchor, {
					class: 'p-1',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_2();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
							SegmentedControl_Indicator($$anchor, {});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
							SegmentedControl_Item($$anchor, {
								value: 'light',
								class: 'btn-xs',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_5 = $.first_child(fragment_2);

									$.component(node_5, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
										SegmentedControl_ItemText($$anchor, {
											children: ($$anchor, $$slotProps) => {
												SunIcon($$anchor, { class: 'size-elem-xs' });
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
										SegmentedControl_ItemHiddenInput($$anchor, {});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
							SegmentedControl_Item_1($$anchor, {
								value: 'dark',
								class: 'btn-xs',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_8 = $.first_child(fragment_4);

									$.component(node_8, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
										SegmentedControl_ItemText_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												MoonIcon($$anchor, { class: 'size-elem-xs' });
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
										SegmentedControl_ItemHiddenInput_1($$anchor, {});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
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

	var node_10 = $.sibling(node_1, 4);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_6 = root_3();
			var node_11 = $.first_child(fragment_6);

			SegmentedControl(node_11, {
				get value() {
					return $.get(view);
				},
				onValueChange: (details) => $.set(view, details.value ?? 'preview', true),
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = $.comment();
					var node_12 = $.first_child(fragment_7);

					$.component(node_12, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control_1) => {
						SegmentedControl_Control_1($$anchor, {
							class: 'p-1',
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_2();
								var node_13 = $.first_child(fragment_8);

								$.component(node_13, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator_1) => {
									SegmentedControl_Indicator_1($$anchor, {});
								});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_2) => {
									SegmentedControl_Item_2($$anchor, {
										value: 'preview',
										class: 'btn-xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_1();
											var node_15 = $.first_child(fragment_9);

											$.component(node_15, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_2) => {
												SegmentedControl_ItemText_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Preview');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_16 = $.sibling(node_15, 2);

											$.component(node_16, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_2) => {
												SegmentedControl_ItemHiddenInput_2($$anchor, {});
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								var node_17 = $.sibling(node_14, 2);

								$.component(node_17, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_3) => {
									SegmentedControl_Item_3($$anchor, {
										value: 'code',
										class: 'btn-xs',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root_1();
											var node_18 = $.first_child(fragment_10);

											$.component(node_18, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_3) => {
												SegmentedControl_ItemText_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Code');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_19 = $.sibling(node_18, 2);

											$.component(node_19, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_3) => {
												SegmentedControl_ItemHiddenInput_3($$anchor, {});
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var button = $.sibling(node_11, 4);
			var node_20 = $.child(button);

			{
				var consequent_1 = ($$anchor) => {
					ThumbsUpIcon($$anchor, {});
				};

				var alternate = ($$anchor) => {
					CopyIcon($$anchor, {});
				};

				$.if(node_20, ($$render) => {
					if ($.get(copied)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(button);
			$.delegated('click', button, copyCode);
			$.append($$anchor, fragment_6);
		};

		var alternate_1 = ($$anchor) => {
			var a = root_4();
			var node_21 = $.child(a);

			LockIcon(node_21, {});
			$.next(2);
			$.reset(a);
			$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/overview/pricing')]);
			$.append($$anchor, a);
		};

		$.if(node_10, ($$render) => {
			if (!locked()) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_2);
	$.reset(header);

	var node_22 = $.sibling(header, 2);

	{
		var consequent_3 = ($$anchor) => {
			{
				let $0 = $.derived(() => [
					'card border border-surface-200-800 preset-filled-surface-50-950 flex justify-center items-center p-4 md:p-8',
					{
						'scheme-light': $.get(mode) === 'light',
						'scheme-dark': $.get(mode) === 'dark'
					}
				]);

				DecorStripes($$anchor, {
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_14 = $.comment();
						var node_23 = $.first_child(fragment_14);

						$.snippet(node_23, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate_2 = ($$anchor) => {
			Code($$anchor, {
				get code() {
					return code();
				},

				get lang() {
					return $$props.lang;
				}
			});
		};

		$.if(node_22, ($$render) => {
			if ($.get(view) === 'preview') $$render(consequent_3); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, title()));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);