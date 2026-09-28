import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import IconCircleUserRound from '@lucide/svelte/icons/circle-user-round';
import IconX from '@lucide/svelte/icons/x';

var root = $.from_html(`<img class="absolute inset-0 h-full w-full object-cover" alt="Preview of uploaded file"/>`);
var root_1 = $.from_html(`<div aria-hidden="true"><!></div>`);
var root_2 = $.from_html(`<p class="text-muted-foreground mt-2 text-xs lg:opacity-0 lg:group-focus-within/item:opacity-100 lg:group-hover/item:opacity-100"> </p>`);
var root_3 = $.from_html(`<div><div class="relative inline-flex"><!> <!> <input type="file" class="hidden" accept="image/*" aria-label="Upload image file"/></div> <!> <div class="sr-only" aria-live="polite" role="status"> </div></div>`);

export default function Button_49($$anchor) {
	let fileInput;
	let fileName = $.state(null);
	let previewUrl = $.state(null);

	function handleThumbnailClick() {
		fileInput.click();
	}

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
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(previewUrl) ? 'Change image' : 'Upload image');

		Button(node, {
			variant: 'outline',
			class: 'relative size-16 overflow-hidden',
			onclick: handleThumbnailClick,
			get 'aria-label'() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var img = root();

						$.template_effect(() => $.set_attribute(img, 'src', $.get(previewUrl)));
						$.append($$anchor, img);
					};

					var alternate = ($$anchor) => {
						var div_2 = root_1();
						var node_2 = $.child(div_2);

						IconCircleUserRound(node_2, {
							class: 'opacity-60',
							width: '16',
							height: '16',
							'stroke-width': '2'
						});

						$.reset(div_2);
						$.append($$anchor, div_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(previewUrl)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Button($$anchor, {
				onclick: handleRemove,
				size: 'icon',
				variant: 'destructive',
				class: 'border-background absolute -top-2 -right-2 size-6 rounded-full border-2',
				'aria-label': 'Remove image',
				children: ($$anchor, $$slotProps) => {
					IconX($$anchor, { size: 16 });
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if ($.get(previewUrl)) $$render(consequent_1);
		});
	}

	var input = $.sibling(node_3, 2);

	$.bind_this(input, ($$value) => fileInput = $$value, () => fileInput);
	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var p = root_2();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(fileName)));
			$.append($$anchor, p);
		};

		$.if(node_4, ($$render) => {
			if ($.get(fileName)) $$render(consequent_2);
		});
	}

	var div_3 = $.sibling(node_4, 2);
	var text_1 = $.only_child(div_3, true);

	$.reset(div);

	$.template_effect(() => $.set_text(text_1, $.get(previewUrl)
		? 'Image uploaded and preview available'
		: 'No image uploaded'));

	$.delegated('change', input, handleFileChange);
	$.append($$anchor, div);
}

$.delegate(['change']);