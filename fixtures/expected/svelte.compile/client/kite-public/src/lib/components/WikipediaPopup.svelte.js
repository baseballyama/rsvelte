import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BaseModal from './BaseModal.svelte';

var root = $.from_html(`<img class="mb-4 w-full rounded-lg h-full object-contain"/>`);
var root_1 = $.from_html(`<div class="p-6"><!> <p class="text-gray-700 dark:text-gray-300"> </p> <a target="_blank" rel="noopener noreferrer" class="mt-4 inline-block text-blue-500 hover:underline">Read more on Wikipedia →</a></div>`);

export default function WikipediaPopup($$anchor, $$props) {
	// Props
	BaseModal($$anchor, {
		get isOpen() {
			return $$props.visible;
		},

		get onClose() {
			return $$props.onClose;
		},

		get title() {
			return $$props.title;
		},
		size: 'md',
		position: 'center',
		ariaLabel: 'Wikipedia article information',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(() => {
						$.set_attribute(img, 'src', $$props.imageUrl);
						$.set_attribute(img, 'alt', $$props.title);
					});

					$.append($$anchor, img);
				};

				$.if(node, ($$render) => {
					if ($$props.imageUrl) $$render(consequent);
				});
			}

			var p = $.sibling(node, 2);
			var text = $.only_child(p, true);
			var a = $.sibling(p, 2);

			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_text(text, $$props.content);
					$.set_attribute(a, 'href', `https://en.wikipedia.org/wiki/${$0 ?? ''}`);
				},
				[() => encodeURIComponent($$props.title)]
			);

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}