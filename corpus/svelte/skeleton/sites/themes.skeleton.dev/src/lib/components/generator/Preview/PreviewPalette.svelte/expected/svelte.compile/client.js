import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as constants from '$lib/constants/generator';
import { globals } from '$lib/state/generator.svelte';
import SparklesIcons from '@lucide/svelte/icons/sparkles';
import SwatchBook from '@lucide/svelte/icons/swatch-book';

var root = $.from_html(`<div><span> </span></div>`);
var root_1 = $.from_html(`<div class="space-y-4"><strong class="block text-center opacity-60"> </strong> <div class="grid grid-rows-11"></div></div>`);
var root_2 = $.from_html(`<div class="space-y-10"><section class="space-y-4"><header class="flex justify-between items-center gap-4"><h2 class="h2">Colors</h2> <a href="https://skeleton.dev/docs/svelte/design/colors" target="_blank" class="btn btn-xs preset-tonal">View Docs</a></header> <div class="grid grid-cols-1 xl:grid-cols-7"></div></section> <section class="space-y-4"><header class="flex justify-between items-center gap-4"><h3 class="h3">Brand Color</h3> <a href="https://skeleton.dev/docs/svelte/design/colors#brand-color" target="_blank" class="btn btn-xs preset-tonal">View Docs</a></header> <div class="grid grid-cols-3 gap-4"><div class="card p-4 preset-filled-brand flex justify-center items-center gap-2"><!> <span>Filled</span></div> <div class="card p-4 preset-outlined-brand flex justify-center items-center gap-2"><!> <span>Outlined</span></div> <div class="card p-4 preset-tonal-brand flex justify-center items-center gap-2"><!> <span>Tonal</span></div></div></section> <section class="space-y-4"><header class="flex justify-between items-center gap-4"><h3 class="h3">Presets</h3> <a href="https://skeleton.dev/docs/svelte/tailwind-utilities/presets" target="_blank" class="btn btn-xs preset-tonal">View Docs</a></header> <div class="space-y-2"><h3 class="h5">Filled</h3> <div class="w-full grid grid-cols-11 gap-4"><div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-950-50"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-900-100"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-800-200"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-700-300"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-600-400"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-500"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-400-600"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-300-700"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-200-800"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-100-900"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-filled-primary-50-950"><!></div></div></div> <div class="space-y-2"><h3 class="h5">Outlined</h3> <div class="w-full grid grid-cols-11 gap-4"><div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-950-50"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-900-100"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-800-200"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-700-300"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-600-400"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-500"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-400-600"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-300-700"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-200-800"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-100-900"><!></div> <div class="aspect-square rounded-full flex justify-center items-center border! preset-outlined-primary-50-950"><!></div></div></div> <div class="space-y-2"><h3 class="h5">Tonal</h3> <div class="w-full grid grid-cols-11 gap-4"><div class="aspect-square rounded-full flex justify-center items-center preset-tonal-primary"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-tonal-secondary"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-tonal-tertiary"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-tonal-success"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-tonal-warning"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-tonal-error"><!></div> <div class="aspect-square rounded-full flex justify-center items-center preset-tonal"><!></div></div></div></section></div>`);

export default function PreviewPalette($$anchor, $$props) {
	$.push($$props, true);

	const palette = [
		{
			name: 'Primary',
			ramp: [
				{
					value: 50,
					base: 'bg-primary-50',
					contrast: 'text-primary-contrast-50'
				},

				{
					value: 100,
					base: 'bg-primary-100',
					contrast: 'text-primary-contrast-100'
				},

				{
					value: 200,
					base: 'bg-primary-200',
					contrast: 'text-primary-contrast-200'
				},

				{
					value: 300,
					base: 'bg-primary-300',
					contrast: 'text-primary-contrast-300'
				},

				{
					value: 400,
					base: 'bg-primary-400',
					contrast: 'text-primary-contrast-400'
				},

				{
					value: 500,
					base: 'bg-primary-500',
					contrast: 'text-primary-contrast-500'
				},

				{
					value: 600,
					base: 'bg-primary-600',
					contrast: 'text-primary-contrast-600'
				},

				{
					value: 700,
					base: 'bg-primary-700',
					contrast: 'text-primary-contrast-700'
				},

				{
					value: 800,
					base: 'bg-primary-800',
					contrast: 'text-primary-contrast-800'
				},

				{
					value: 900,
					base: 'bg-primary-900',
					contrast: 'text-primary-contrast-900'
				},

				{
					value: 950,
					base: 'bg-primary-950',
					contrast: 'text-primary-contrast-950'
				}
			]
		},

		{
			name: 'Secondary',
			ramp: [
				{
					value: 50,
					base: 'bg-secondary-50',
					contrast: 'text-secondary-contrast-50'
				},

				{
					value: 100,
					base: 'bg-secondary-100',
					contrast: 'text-secondary-contrast-100'
				},

				{
					value: 200,
					base: 'bg-secondary-200',
					contrast: 'text-secondary-contrast-200'
				},

				{
					value: 300,
					base: 'bg-secondary-300',
					contrast: 'text-secondary-contrast-300'
				},

				{
					value: 400,
					base: 'bg-secondary-400',
					contrast: 'text-secondary-contrast-400'
				},

				{
					value: 500,
					base: 'bg-secondary-500',
					contrast: 'text-secondary-contrast-500'
				},

				{
					value: 600,
					base: 'bg-secondary-600',
					contrast: 'text-secondary-contrast-600'
				},

				{
					value: 700,
					base: 'bg-secondary-700',
					contrast: 'text-secondary-contrast-700'
				},

				{
					value: 800,
					base: 'bg-secondary-800',
					contrast: 'text-secondary-contrast-800'
				},

				{
					value: 900,
					base: 'bg-secondary-900',
					contrast: 'text-secondary-contrast-900'
				},

				{
					value: 950,
					base: 'bg-secondary-950',
					contrast: 'text-secondary-contrast-950'
				}
			]
		},

		{
			name: 'Tertiary',
			ramp: [
				{
					value: 50,
					base: 'bg-tertiary-50',
					contrast: 'text-tertiary-contrast-50'
				},

				{
					value: 100,
					base: 'bg-tertiary-100',
					contrast: 'text-tertiary-contrast-100'
				},

				{
					value: 200,
					base: 'bg-tertiary-200',
					contrast: 'text-tertiary-contrast-200'
				},

				{
					value: 300,
					base: 'bg-tertiary-300',
					contrast: 'text-tertiary-contrast-300'
				},

				{
					value: 400,
					base: 'bg-tertiary-400',
					contrast: 'text-tertiary-contrast-400'
				},

				{
					value: 500,
					base: 'bg-tertiary-500',
					contrast: 'text-tertiary-contrast-500'
				},

				{
					value: 600,
					base: 'bg-tertiary-600',
					contrast: 'text-tertiary-contrast-600'
				},

				{
					value: 700,
					base: 'bg-tertiary-700',
					contrast: 'text-tertiary-contrast-700'
				},

				{
					value: 800,
					base: 'bg-tertiary-800',
					contrast: 'text-tertiary-contrast-800'
				},

				{
					value: 900,
					base: 'bg-tertiary-900',
					contrast: 'text-tertiary-contrast-900'
				},

				{
					value: 950,
					base: 'bg-tertiary-950',
					contrast: 'text-tertiary-contrast-950'
				}
			]
		},

		{
			name: 'Success',
			ramp: [
				{
					value: 50,
					base: 'bg-success-50',
					contrast: 'text-success-contrast-50'
				},

				{
					value: 100,
					base: 'bg-success-100',
					contrast: 'text-success-contrast-100'
				},

				{
					value: 200,
					base: 'bg-success-200',
					contrast: 'text-success-contrast-200'
				},

				{
					value: 300,
					base: 'bg-success-300',
					contrast: 'text-success-contrast-300'
				},

				{
					value: 400,
					base: 'bg-success-400',
					contrast: 'text-success-contrast-400'
				},

				{
					value: 500,
					base: 'bg-success-500',
					contrast: 'text-success-contrast-500'
				},

				{
					value: 600,
					base: 'bg-success-600',
					contrast: 'text-success-contrast-600'
				},

				{
					value: 700,
					base: 'bg-success-700',
					contrast: 'text-success-contrast-700'
				},

				{
					value: 800,
					base: 'bg-success-800',
					contrast: 'text-success-contrast-800'
				},

				{
					value: 900,
					base: 'bg-success-900',
					contrast: 'text-success-contrast-900'
				},

				{
					value: 950,
					base: 'bg-success-950',
					contrast: 'text-success-contrast-950'
				}
			]
		},

		{
			name: 'Warning',
			ramp: [
				{
					value: 50,
					base: 'bg-warning-50',
					contrast: 'text-warning-contrast-50'
				},

				{
					value: 100,
					base: 'bg-warning-100',
					contrast: 'text-warning-contrast-100'
				},

				{
					value: 200,
					base: 'bg-warning-200',
					contrast: 'text-warning-contrast-200'
				},

				{
					value: 300,
					base: 'bg-warning-300',
					contrast: 'text-warning-contrast-300'
				},

				{
					value: 400,
					base: 'bg-warning-400',
					contrast: 'text-warning-contrast-400'
				},

				{
					value: 500,
					base: 'bg-warning-500',
					contrast: 'text-warning-contrast-500'
				},

				{
					value: 600,
					base: 'bg-warning-600',
					contrast: 'text-warning-contrast-600'
				},

				{
					value: 700,
					base: 'bg-warning-700',
					contrast: 'text-warning-contrast-700'
				},

				{
					value: 800,
					base: 'bg-warning-800',
					contrast: 'text-warning-contrast-800'
				},

				{
					value: 900,
					base: 'bg-warning-900',
					contrast: 'text-warning-contrast-900'
				},

				{
					value: 950,
					base: 'bg-warning-950',
					contrast: 'text-warning-contrast-950'
				}
			]
		},

		{
			name: 'Error',
			ramp: [
				{
					value: 50,
					base: 'bg-error-50',
					contrast: 'text-error-contrast-50'
				},

				{
					value: 100,
					base: 'bg-error-100',
					contrast: 'text-error-contrast-100'
				},

				{
					value: 200,
					base: 'bg-error-200',
					contrast: 'text-error-contrast-200'
				},

				{
					value: 300,
					base: 'bg-error-300',
					contrast: 'text-error-contrast-300'
				},

				{
					value: 400,
					base: 'bg-error-400',
					contrast: 'text-error-contrast-400'
				},

				{
					value: 500,
					base: 'bg-error-500',
					contrast: 'text-error-contrast-500'
				},

				{
					value: 600,
					base: 'bg-error-600',
					contrast: 'text-error-contrast-600'
				},

				{
					value: 700,
					base: 'bg-error-700',
					contrast: 'text-error-contrast-700'
				},

				{
					value: 800,
					base: 'bg-error-800',
					contrast: 'text-error-contrast-800'
				},

				{
					value: 900,
					base: 'bg-error-900',
					contrast: 'text-error-contrast-900'
				},

				{
					value: 950,
					base: 'bg-error-950',
					contrast: 'text-error-contrast-950'
				}
			]
		},

		{
			name: 'Surface',
			ramp: [
				{
					value: 50,
					base: 'bg-surface-50',
					contrast: 'text-surface-contrast-50'
				},

				{
					value: 100,
					base: 'bg-surface-100',
					contrast: 'text-surface-contrast-100'
				},

				{
					value: 200,
					base: 'bg-surface-200',
					contrast: 'text-surface-contrast-200'
				},

				{
					value: 300,
					base: 'bg-surface-300',
					contrast: 'text-surface-contrast-300'
				},

				{
					value: 400,
					base: 'bg-surface-400',
					contrast: 'text-surface-contrast-400'
				},

				{
					value: 500,
					base: 'bg-surface-500',
					contrast: 'text-surface-contrast-500'
				},

				{
					value: 600,
					base: 'bg-surface-600',
					contrast: 'text-surface-contrast-600'
				},

				{
					value: 700,
					base: 'bg-surface-700',
					contrast: 'text-surface-contrast-700'
				},

				{
					value: 800,
					base: 'bg-surface-800',
					contrast: 'text-surface-contrast-800'
				},

				{
					value: 900,
					base: 'bg-surface-900',
					contrast: 'text-surface-contrast-900'
				},

				{
					value: 950,
					base: 'bg-surface-950',
					contrast: 'text-surface-contrast-950'
				}
			]
		}
	];

	var $$exports = { palette };
	var div = root_2();
	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 2);

	$.each(div_1, 20, () => palette, (color) => color, ($$anchor, color) => {
		var div_2 = root_1();
		var strong = $.child(div_2);
		var text = $.only_child(strong, true);
		var div_3 = $.sibling(strong, 2);

		$.each(div_3, 20, () => color.ramp, (shade) => shade, ($$anchor, shade) => {
			var div_4 = root();
			var span = $.child(div_4);
			let classes;
			var text_1 = $.only_child(span, true);

			$.reset(div_4);

			$.template_effect(() => {
				$.set_class(div_4, 1, `${shade.base} `);
				classes = $.set_class(span, 1, `flex items-center justify-center py-2 font-bold text-xs ${shade.contrast ?? ''}`, null, classes, { underline: shade.value === 500 });
				$.set_text(text_1, shade.value);
			});

			$.append($$anchor, div_4);
		});

		$.reset(div_3);
		$.reset(div_2);
		$.template_effect(() => $.set_text(text, color.name));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_5 = $.sibling($.child(section_1), 2);
	var div_6 = $.child(div_5);
	var node = $.child(div_6);

	SparklesIcons(node, { size: 24 });
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_1 = $.child(div_7);

	SparklesIcons(node_1, { size: 24 });
	$.next(2);
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_2 = $.child(div_8);

	SparklesIcons(node_2, { size: 24 });
	$.next(2);
	$.reset(div_8);
	$.reset(div_5);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_9 = $.sibling($.child(section_2), 2);
	var div_10 = $.sibling($.child(div_9), 2);
	var div_11 = $.child(div_10);
	var node_3 = $.child(div_11);

	SwatchBook(node_3, { size: 24 });
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_4 = $.child(div_12);

	SwatchBook(node_4, { size: 24 });
	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_5 = $.child(div_13);

	SwatchBook(node_5, { size: 24 });
	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_6 = $.child(div_14);

	SwatchBook(node_6, { size: 24 });
	$.reset(div_14);

	var div_15 = $.sibling(div_14, 2);
	var node_7 = $.child(div_15);

	SwatchBook(node_7, { size: 24 });
	$.reset(div_15);

	var div_16 = $.sibling(div_15, 2);
	var node_8 = $.child(div_16);

	SwatchBook(node_8, { size: 24 });
	$.reset(div_16);

	var div_17 = $.sibling(div_16, 2);
	var node_9 = $.child(div_17);

	SwatchBook(node_9, { size: 24 });
	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var node_10 = $.child(div_18);

	SwatchBook(node_10, { size: 24 });
	$.reset(div_18);

	var div_19 = $.sibling(div_18, 2);
	var node_11 = $.child(div_19);

	SwatchBook(node_11, { size: 24 });
	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var node_12 = $.child(div_20);

	SwatchBook(node_12, { size: 24 });
	$.reset(div_20);

	var div_21 = $.sibling(div_20, 2);
	var node_13 = $.child(div_21);

	SwatchBook(node_13, { size: 24 });
	$.reset(div_21);
	$.reset(div_10);
	$.reset(div_9);

	var div_22 = $.sibling(div_9, 2);
	var div_23 = $.sibling($.child(div_22), 2);
	var div_24 = $.child(div_23);
	var node_14 = $.child(div_24);

	SwatchBook(node_14, { size: 24 });
	$.reset(div_24);

	var div_25 = $.sibling(div_24, 2);
	var node_15 = $.child(div_25);

	SwatchBook(node_15, { size: 24 });
	$.reset(div_25);

	var div_26 = $.sibling(div_25, 2);
	var node_16 = $.child(div_26);

	SwatchBook(node_16, { size: 24 });
	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);
	var node_17 = $.child(div_27);

	SwatchBook(node_17, { size: 24 });
	$.reset(div_27);

	var div_28 = $.sibling(div_27, 2);
	var node_18 = $.child(div_28);

	SwatchBook(node_18, { size: 24 });
	$.reset(div_28);

	var div_29 = $.sibling(div_28, 2);
	var node_19 = $.child(div_29);

	SwatchBook(node_19, { size: 24 });
	$.reset(div_29);

	var div_30 = $.sibling(div_29, 2);
	var node_20 = $.child(div_30);

	SwatchBook(node_20, { size: 24 });
	$.reset(div_30);

	var div_31 = $.sibling(div_30, 2);
	var node_21 = $.child(div_31);

	SwatchBook(node_21, { size: 24 });
	$.reset(div_31);

	var div_32 = $.sibling(div_31, 2);
	var node_22 = $.child(div_32);

	SwatchBook(node_22, { size: 24 });
	$.reset(div_32);

	var div_33 = $.sibling(div_32, 2);
	var node_23 = $.child(div_33);

	SwatchBook(node_23, { size: 24 });
	$.reset(div_33);

	var div_34 = $.sibling(div_33, 2);
	var node_24 = $.child(div_34);

	SwatchBook(node_24, { size: 24 });
	$.reset(div_34);
	$.reset(div_23);
	$.reset(div_22);

	var div_35 = $.sibling(div_22, 2);
	var div_36 = $.sibling($.child(div_35), 2);
	var div_37 = $.child(div_36);
	var node_25 = $.child(div_37);

	SwatchBook(node_25, { size: 24 });
	$.reset(div_37);

	var div_38 = $.sibling(div_37, 2);
	var node_26 = $.child(div_38);

	SwatchBook(node_26, { size: 24 });
	$.reset(div_38);

	var div_39 = $.sibling(div_38, 2);
	var node_27 = $.child(div_39);

	SwatchBook(node_27, { size: 24 });
	$.reset(div_39);

	var div_40 = $.sibling(div_39, 2);
	var node_28 = $.child(div_40);

	SwatchBook(node_28, { size: 24 });
	$.reset(div_40);

	var div_41 = $.sibling(div_40, 2);
	var node_29 = $.child(div_41);

	SwatchBook(node_29, { size: 24 });
	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var node_30 = $.child(div_42);

	SwatchBook(node_30, { size: 24 });
	$.reset(div_42);

	var div_43 = $.sibling(div_42, 2);
	var node_31 = $.child(div_43);

	SwatchBook(node_31, { size: 24 });
	$.reset(div_43);
	$.reset(div_36);
	$.reset(div_35);
	$.reset(section_2);
	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}