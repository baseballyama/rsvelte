import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';

export default function ImageEditorOverlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			visible = false,
			image_element = null,
			onClick = () => {},
			onDelete = () => {},
			onMouseDown = () => {},
			showDelete = true
		} = $$props;

		let overlay_element = void 0;

		// Handle mouse move detection to hide overlay when mouse leaves image_element bounds
		function handleBodyMouseMove(event) {
			if (!visible || !image_element) return;

			const rect = image_element.getBoundingClientRect();
			const isOutside = event.x < rect.left || event.x > rect.right || event.y < rect.top || event.y > rect.bottom;

			if (isOutside) {
				visible = false;
			}
		}

		// Add/remove iframe/body mouse move listener when visible state changes
		// Cleanup on component destroy
		// Position the overlay over the target image_element
		function positionOverlay() {
			if (!overlay_element || !image_element) return;

			const elementRect = image_element.getBoundingClientRect();
			const iframeElement = image_element.ownerDocument.defaultView.frameElement;

			if (iframeElement) {
				// If within an iframe element, adjust positioning relative to it
				const iframeRect = iframeElement.getBoundingClientRect();

				overlay_element.style.left = `${elementRect.left + iframeRect.left}px`;
				overlay_element.style.top = `${elementRect.top + iframeRect.top}px`;
			} else {
				// For RichText editor, position directly over the image_element
				// Small adjustment to account for any positioning quirks
				overlay_element.style.left = `${elementRect.left - 9}px`; // adjust to dialog padding

				overlay_element.style.top = `${elementRect.top - 9}px`; // adjust to dialog padding
			}

			overlay_element.style.width = `${elementRect.width}px`;
			overlay_element.style.height = `${elementRect.height}px`;
			overlay_element.style.borderRadius = getComputedStyle(image_element).borderRadius;
		}

		// Update position when element changes
		// Handle events
		function handleClick() {
			visible = false;
			onClick();
		}

		function handleDelete(event) {
			visible = false;
			event.stopPropagation(); // Prevent triggering the main click handler
			onDelete();
		}

		function handleMouseDown() {
			onMouseDown();
		}

		if (visible && image_element) {
			$$renderer.push(`<!--[0--><div class="image-editor-overlay svelte-o8c9g0" role="toolbar" tabindex="-1"><button class="overlay-button edit-button svelte-o8c9g0">`);

			Icon($$renderer, {
				icon: 'uil:image-upload',
				style: ' width: clamp(1rem, 50%, 1.5rem)'
			});

			$$renderer.push(`<!----></button> `);

			if (showDelete) {
				$$renderer.push(`<!--[0--><button class="overlay-button delete-button svelte-o8c9g0">`);

				Icon($$renderer, {
					icon: 'lucide:trash-2',
					style: ' width: clamp(1rem, 50%, 1.5rem)'
				});

				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { visible, image_element });
	});
}