import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OpenInStackblitz from './open-in-stackblitz.svelte';
import Code from '@/components/ui/code.svelte';
import CodeIcon from '@lucide/svelte/icons/code';
import EyeIcon from '@lucide/svelte/icons/eye';
import PaletteIcon from '@lucide/svelte/icons/palette';
import { Tabs, ToggleGroup, LocaleProvider } from '@skeletonlabs/skeleton-svelte';

const presets = [
	'',
	'bg-surface-50-950',
	'preset-filled-primary-500',
	'preset-filled-secondary-500',
	'preset-filled-tertiary-500',
	'preset-filled-success-500',
	'preset-filled-warning-500',
	'preset-filled-error-500',
	'preset-filled-surface-500',
	'bg-linear-to-br from-primary-500 to-secondary-500',
	'bg-linear-to-br from-secondary-500 to-tertiary-500',
	'bg-linear-to-br from-tertiary-500 to-primary-500'
];

let activePreset = $.state($.proxy(presets[0]));
let direction = $.state('ltr');
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="btn preset-outlined-surface-200-800 hover:preset-tonal" title="Learn how to use this feature." aria-label="Learn how to use this feature.">Learn</a>`);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="size-4"><text x="8" y="12" text-anchor="middle" font-size="9" font-weight="bold" font-family="sans-serif"> </text></svg>`);
var root_3 = $.from_html(`<button type="button"><span class="sr-only"> </span></button>`);
var root_4 = $.from_html(`<div class="card border border-surface-200-800 max-w-full overflow-hidden"><header class="flex justify-between items-center gap-3 border-b border-surface-200-800 p-3"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!> <!></div></header> <div></div> <div><!></div> <!></div>`);

export default function Preview($$anchor, $$props) {
	$.push($$props, true);

	const files = $.prop($$props, 'files', 19, () => ({}));
	let viewMode = $.state('preview');
	let customizeMode = $.state('');
	const fileEntries = $.derived(() => Object.entries(files()));
	var div = root_4();
	var header = $.child(div);
	var div_1 = $.child(header);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => [$.get(viewMode)]);

		ToggleGroup(node, {
			get value() {
				return $.get($0);
			},
			onValueChange: (details) => $.set(viewMode, details.value[0], true),
			deselectable: false,
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
					ToggleGroup_Item($$anchor, {
						value: 'preview',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'Preview Feature',
						'aria-label': 'Preview Feature',
						children: ($$anchor, $$slotProps) => {
							EyeIcon($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
					ToggleGroup_Item_1($$anchor, {
						value: 'code',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'View Code',
						'aria-label': 'View Code',
						children: ($$anchor, $$slotProps) => {
							CodeIcon($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var a = root_1();

			$.template_effect(() => $.set_attribute(a, 'href', $$props.learnUrl));
			$.append($$anchor, a);
		};

		$.if(node_3, ($$render) => {
			if ($$props.learnUrl) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(direction) === 'rtl' ? ['rtl'] : []);
		let $1 = $.derived(() => $.get(viewMode) === 'preview' ? 'block' : 'hidden');

		ToggleGroup(node_4, {
			get value() {
				return $.get($0);
			},
			onValueChange: (details) => $.set(direction, details.value[0] === 'rtl' ? 'rtl' : 'ltr', true),
			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
					ToggleGroup_Item_2($$anchor, {
						value: 'rtl',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'Toggle LTR/RTL Modes',
						'aria-label': 'Toggle LTR/RTL Modes',
						children: ($$anchor, $$slotProps) => {
							var svg = root_2();
							var text = $.child(svg);
							var text_1 = $.only_child(text, true);

							$.reset(svg);
							$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(direction).toUpperCase()]);
							$.append($$anchor, svg);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => [$.get(customizeMode)]);
		let $1 = $.derived(() => $.get(viewMode) === 'preview' ? 'block' : 'hidden');

		ToggleGroup(node_6, {
			get value() {
				return $.get($0);
			},
			onValueChange: (details) => $.set(customizeMode, details.value[0], true),
			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
					ToggleGroup_Item_3($$anchor, {
						value: 'customize',
						class: 'data-[state=on]:preset-tonal text-surface-contrast-50-950',
						title: 'Customize',
						'aria-label': 'Customize',
						children: ($$anchor, $$slotProps) => {
							PaletteIcon($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	}

	var node_8 = $.sibling(node_6, 2);

	{
		var consequent_1 = ($$anchor) => {
			OpenInStackblitz($$anchor, {
				get framework() {
					return $$props.framework;
				},

				get files() {
					return files();
				}
			});
		};

		$.if(node_8, ($$render) => {
			if ($$props.framework) $$render(consequent_1);
		});
	}

	$.reset(div_2);
	$.reset(header);

	var div_3 = $.sibling(header, 2);

	$.each(div_3, 22, () => presets, (preset) => preset, ($$anchor, preset, i) => {
		var button = root_3();
		let classes;
		var span = $.child(button);
		var text_2 = $.only_child(span, true);

		$.reset(button);

		$.template_effect(
			($0, $1) => {
				classes = $.set_class(button, 1, `flex-1 w-full aspect-square rounded-full hover:brightness-110 ${preset ?? ''}`, null, classes, { border: $0, 'border-surface-200-800': $1 });
				$.set_text(text_2, preset);
			},
			[
				() => [0, 1].includes($.get(i)),
				() => [0, 1].includes($.get(i))
			]
		);

		$.delegated('click', button, () => $.set(activePreset, preset, true));
		$.append($$anchor, button);
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_9 = $.child(div_4);

	{
		let $0 = $.derived(() => $.get(direction) === 'ltr' ? 'en-US' : 'ar-SA');

		LocaleProvider(node_9, {
			get locale() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_10 = $.first_child(fragment_7);

				$.snippet(node_10, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_4);

	var node_11 = $.sibling(div_4, 2);

	{
		let $0 = $.derived(() => $.get(fileEntries)[0]?.[0]);
		let $1 = $.derived(() => $.get(viewMode) === 'code' && files() ? 'block' : 'hidden');

		Tabs(node_11, {
			get defaultValue() {
				return $.get($0);
			},

			get class() {
				return `p-3 ${$.get($1) ?? ''}`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root();
				var node_12 = $.first_child(fragment_8);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_9 = $.comment();
						var node_13 = $.first_child(fragment_9);

						$.component(node_13, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								class: 'overflow-x-auto',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_14 = $.first_child(fragment_10);

									{
										var consequent_2 = ($$anchor) => {
											var fragment_11 = $.comment();
											var node_15 = $.first_child(fragment_11);

											$.each(node_15, 17, () => $.get(fileEntries), ([file]) => file, ($$anchor, $$item) => {
												var $$array = $.derived(() => $.to_array($.get($$item), 1));
												let file = () => $.get($$array)[0];
												var fragment_12 = $.comment();
												var node_16 = $.first_child(fragment_12);

												$.component(node_16, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
													Tabs_Trigger($$anchor, {
														get value() {
															return file();
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, file()));
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											});

											$.append($$anchor, fragment_11);
										};

										$.if(node_14, ($$render) => {
											if (files()) $$render(consequent_2);
										});
									}

									var node_17 = $.sibling(node_14, 2);

									$.component(node_17, () => Tabs.Indicator, ($$anchor, Tabs_Indicator) => {
										Tabs_Indicator($$anchor, {});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					};

					$.if(node_12, ($$render) => {
						if ($.get(fileEntries).length > 1) $$render(consequent_3);
					});
				}

				var node_18 = $.sibling(node_12, 2);

				$.each(node_18, 17, () => $.get(fileEntries), ([file, content]) => file, ($$anchor, $$item) => {
					var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
					let file = () => $.get($$array_1)[0];
					let content = () => $.get($$array_1)[1];
					var fragment_14 = $.comment();
					var node_19 = $.first_child(fragment_14);

					$.component(node_19, () => Tabs.Content, ($$anchor, Tabs_Content) => {
						Tabs_Content($$anchor, {
							get value() {
								return file();
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => file().split('.').pop());

									Code($$anchor, {
										get code() {
											return content();
										},

										get lang() {
											return $.get($0);
										}
									});
								}
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_14);
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_3, 1, `border-b border-surface-200-800 p-3 flex items-center gap-3 ${$.get(viewMode) === 'preview' && $.get(customizeMode) === 'customize' ? 'block' : 'hidden'}`);
		$.set_attribute(div_4, 'dir', $.get(direction));
		$.set_class(div_4, 1, `p-8 flex justify-center items-center ${$.get(activePreset) ?? ''} ${$.get(viewMode) === 'preview' && $$props.children ? 'block' : 'hidden'}`);
		div_4.dir = div_4.dir;
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);