import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '../ui/button';
import { X } from '@lucide/svelte';

var root = $.from_html(`<div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><img alt="Expanded screenshot" class="max-h-[80vh] max-w-[80vw] object-contain"/> <!></div>`);

export default function ImageLightbox($$anchor, $$props) {
	$.push($$props, true);

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			$$props.onClose();
		}
	}

	var div = root();

	$.set_attribute(div, 'tabindex', 0);

	var img = $.child(div);
	var node = $.sibling(img, 2);

	Button(node, {
		variant: 'ghost',
		size: 'icon',
		class: 'absolute top-4 right-4 text-white hover:text-white',
		get onclick() {
			return $$props.onClose;
		},

		children: ($$anchor, $$slotProps) => {
			X($$anchor, { class: 'size-6' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.template_effect(() => $.set_attribute(img, 'src', $$props.imageUrl));

	$.delegated('click', div, function (...$$args) {
		$$props.onClose?.apply(this, $$args);
	});

	$.delegated('keydown', div, handleKeydown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);