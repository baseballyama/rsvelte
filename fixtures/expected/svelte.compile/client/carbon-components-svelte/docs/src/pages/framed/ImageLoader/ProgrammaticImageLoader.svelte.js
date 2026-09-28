import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ImageLoader } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ProgrammaticImageLoader($$anchor) {
	const src = "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg";
	const srcError = `${src}1`;
	let imageLoader;
	let imageLoadError;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => !imageLoader || imageLoadError);

		Button(node, {
			kind: 'ghost',
			get disabled() {
				return $.get($0);
			},
			$$events: { click: () => imageLoader.loadImage(srcError) },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Simulate error');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	$.bind_this(
		ImageLoader(node_1, {
			fadeIn: true,
			src,
			get error() {
				return imageLoadError;
			},

			set error($$value) {
				imageLoadError = $$value;
			},

			$$slots: {
				error: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						kind: 'ghost',
						$$events: { click: () => imageLoader.loadImage(src) },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Error. Try again');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}
			}
		}),
		($$value) => imageLoader = $$value,
		() => imageLoader
	);

	$.append($$anchor, fragment);
}