import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import IconCircleUserRound from '@lucide/svelte/icons/circle-user-round';

var root = $.from_html(`<img class="h-full w-full object-cover" alt="Preview of uploaded file" width="32" height="32"/>`);
var root_1 = $.from_html(`<div aria-hidden="true"><!></div>`);
var root_2 = $.from_html(`<div class="mt-2 inline-flex gap-2 text-xs"><p class="text-muted-foreground truncate" aria-live="polite"> </p> <button class="font-medium text-red-500 hover:underline">Remove</button></div>`);
var root_3 = $.from_html(`<div><div class="inline-flex items-center space-x-2 rtl:space-x-reverse"><div class="border-input relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border" role="img"><!></div> <div class="relative inline-block"><!> <input type="file" class="hidden" accept="image/*" aria-label="Upload image file"/></div></div> <!> <div class="sr-only" aria-live="polite" role="status"> </div></div>`);

export default function Button_48($$anchor) {
	let fileInput;
	let files = $.state(null);
	let fileName = $.state(null);
	let previewUrl = $.state(null);

	const handleButtonClick = () => {
		fileInput.click();
	};

	const handleFileChange = (e) => {
		const file = e.currentTarget.files?.[0];

		if (file) {
			$.set(fileName, file.name, true);
			$.set(previewUrl, URL.createObjectURL(file), true);
		}
	};

	const handleRemove = () => {
		$.set(fileName, null);
		$.set(previewUrl, null);
		fileInput.value = '';
	};

	var div = root_3();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => $.set_attribute(img, 'src', $.get(previewUrl)));
			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_1();
			var node_1 = $.child(div_3);

			IconCircleUserRound(node_1, { class: 'opacity-60', size: 16, 'stroke-width': '2' });
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(previewUrl)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_2 = $.child(div_4);

	Button(node_2, {
		onclick: handleButtonClick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(fileName) ? 'Change image' : 'Upload image'));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var input = $.sibling(node_2, 2);

	$.bind_this(input, ($$value) => fileInput = $$value, () => fileInput);
	$.reset(div_4);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_2();
			var p = $.child(div_5);
			var text_1 = $.only_child(p, true);
			var button = $.sibling(p, 2);

			$.reset(div_5);

			$.template_effect(() => {
				$.set_text(text_1, $.get(fileName));
				$.set_attribute(button, 'aria-label', `Remove ${$.get(fileName)}`);
			});

			$.delegated('click', button, handleRemove);
			$.append($$anchor, div_5);
		};

		$.if(node_3, ($$render) => {
			if ($.get(fileName)) $$render(consequent_1);
		});
	}

	var div_6 = $.sibling(node_3, 2);
	var text_2 = $.only_child(div_6, true);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div_2, 'aria-label', $.get(previewUrl) ? 'Preview of uploaded file' : 'Default user avatar');

		$.set_text(text_2, $.get(previewUrl)
			? 'Image uploaded and preview available'
			: 'No image uploaded');
	});

	$.delegated('change', input, handleFileChange);
	$.bind_files(input, () => $.get(files), ($$value) => $.set(files, $$value));
	$.append($$anchor, div);
}

$.delegate(['change', 'click']);