import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';

var root = $.from_html(`<button class="overlay-button delete-button svelte-o8c9g0"><!></button>`);
var root_1 = $.from_html(`<div class="image-editor-overlay svelte-o8c9g0" role="toolbar" tabindex="-1"><button class="overlay-button edit-button svelte-o8c9g0"><!></button> <!></div>`);

export default function ImageEditorOverlay($$anchor, $$props) {
	$.push($$props, true);

	let visible = $.prop($$props, 'visible', 15, false),
		image_element = $.prop($$props, 'image_element', 11, null),
		onClick = $.prop($$props, 'onClick', 3, () => {}),
		onDelete = $.prop($$props, 'onDelete', 3, () => {}),
		onMouseDown = $.prop($$props, 'onMouseDown', 3, () => {}),
		showDelete = $.prop($$props, 'showDelete', 3, true);

	let overlay_element = $.state(void 0);

	// Handle mouse move detection to hide overlay when mouse leaves image_element bounds
	function handleBodyMouseMove(event) {
		if (!visible() || !image_element()) return;

		const rect = image_element().getBoundingClientRect();
		const isOutside = event.x < rect.left || event.x > rect.right || event.y < rect.top || event.y > rect.bottom;

		if (isOutside) {
			visible(false);
		}
	}

	// Add/remove iframe/body mouse move listener when visible state changes
	$.user_effect(() => {
		if (!image_element()) return;

		if (visible()) {
			image_element().ownerDocument.body.addEventListener('mousemove', handleBodyMouseMove);
		} else {
			image_element().ownerDocument.body.removeEventListener('mousemove', handleBodyMouseMove);
		}

		// Cleanup on component destroy
		return () => {
			image_element().ownerDocument.body.removeEventListener('mousemove', handleBodyMouseMove);
		};
	});

	// Position the overlay over the target image_element
	function positionOverlay() {
		if (!$.get(overlay_element) || !image_element()) return;

		const elementRect = image_element().getBoundingClientRect();
		const iframeElement = image_element().ownerDocument.defaultView.frameElement;

		if (iframeElement) {
			// If within an iframe element, adjust positioning relative to it
			const iframeRect = iframeElement.getBoundingClientRect();

			$.get(overlay_element).style.left = `${elementRect.left + iframeRect.left}px`;
			$.get(overlay_element).style.top = `${elementRect.top + iframeRect.top}px`;
		} else {
			// For RichText editor, position directly over the image_element
			// Small adjustment to account for any positioning quirks
			$.get(overlay_element // adjust to dialog padding
			).style.left = `${elementRect.left - 9}px`;

			$.get(overlay_element // adjust to dialog padding
			).style.top = `${elementRect.top - 9}px`;
		}

		$.get(overlay_element).style.width = `${elementRect.width}px`;
		$.get(overlay_element).style.height = `${elementRect.height}px`;
		$.get(overlay_element).style.borderRadius = getComputedStyle(image_element()).borderRadius;
	}

	// Update position when element changes
	$.user_effect(() => {
		if (visible() && image_element()) {
			positionOverlay();
		}
	});

	// Handle events
	function handleClick() {
		visible(false);
		onClick()();
	}

	function handleDelete(event) {
		visible(false);
		event.stopPropagation(); // Prevent triggering the main click handler
		onDelete()();
	}

	function handleMouseDown() {
		onMouseDown()();
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var button = $.child(div);
			var node_1 = $.child(button);

			Icon(node_1, {
				icon: 'uil:image-upload',
				style: ' width: clamp(1rem, 50%, 1.5rem)'
			});

			$.reset(button);

			var node_2 = $.sibling(button, 2);

			{
				var consequent = ($$anchor) => {
					var button_1 = root();
					var node_3 = $.child(button_1);

					Icon(node_3, {
						icon: 'lucide:trash-2',
						style: ' width: clamp(1rem, 50%, 1.5rem)'
					});

					$.reset(button_1);
					$.delegated('click', button_1, handleDelete);
					$.append($$anchor, button_1);
				};

				$.if(node_2, ($$render) => {
					if (showDelete()) $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(overlay_element, $$value), () => $.get(overlay_element));

			$.event('wheel', div, () => {
				visible(false // prevent overlay from interrupting scroll, bad ux
				);
			});

			$.delegated('mousedown', div, handleMouseDown);
			$.delegated('click', button, handleClick);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (visible() && image_element()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['mousedown', 'click']);