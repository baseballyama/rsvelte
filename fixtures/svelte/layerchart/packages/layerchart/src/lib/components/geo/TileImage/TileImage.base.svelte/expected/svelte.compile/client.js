import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { tileCache } from './TileImage.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Text',
	'x',
	'y',
	'z',
	'tx',
	'ty',
	'scale',
	'disableCache',
	'debug',
	'url'
]);

var root = $.from_svg(`<image></image><image></image>`, 1);
var root_1 = $.from_svg(`<rect class="lc-tile-image-debug-rect"></rect><!>`, 1);
var root_2 = $.from_svg(`<!><!>`, 1);

export default function TileImage_base($$anchor, $$props) {
	$.push($$props, true);

	let disableCache = $.prop($$props, 'disableCache', 3, false),
		debug = $.prop($$props, 'debug', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let href = $.state($.proxy(disableCache() ? $$props.url($$props.x, $$props.y, $$props.z) : ''));

	function loadImage(url) {
		const key = url;

		if (tileCache.has(key)) {
			tileCache.get(key)?.then((dataUri) => {
				$.set(href, dataUri, true);
			}).catch(() => {});
		} else {
			const promise = new Promise((resolve, reject) => {
				const img = new Image();

				img.crossOrigin = 'anonymous';

				img.onload = function () {
					var canvas = document.createElement('canvas');
					var context = canvas.getContext('2d');

					// @ts-expect-error
					canvas.height = this.naturalHeight;

					// @ts-expect-error
					canvas.width = this.naturalWidth;

					// @ts-expect-error
					context.drawImage(this, 0, 0);

					var dataUri = canvas.toDataURL('image/jpeg');

					$.set(href, dataUri, true);
					resolve(dataUri);
				};

				img.onerror = (err) => {
					tileCache.delete(key);
					reject(err);
				};

				img.src = url;
			});

			tileCache.set(key, promise);
		}
	}

	$.user_effect(() => {
		if (disableCache()) return;

		loadImage($$props.url($$props.x, $$props.y, $$props.z));
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.key(node, () => $.get(href), ($$anchor) => {
		var fragment_1 = root();
		var image = $.first_child(fragment_1);

		$.attribute_effect(
			image,
			($0) => ({
				href: $.get(href),
				x: ($$props.x + $$props.tx) * $$props.scale - 0.5,
				y: ($$props.y + $$props.ty) * $$props.scale - 0.5,
				width: $$props.scale + 1,
				height: $$props.scale + 1,
				...$0
			}),
			[() => extractLayerProps(restProps, 'lc-tile-image-lower')]
		);

		var image_1 = $.sibling(image);

		$.attribute_effect(
			image_1,
			($0) => ({
				href: $.get(href),
				x: ($$props.x + $$props.tx) * $$props.scale,
				y: ($$props.y + $$props.ty) * $$props.scale,
				width: $$props.scale,
				height: $$props.scale,
				...$0
			}),
			[() => extractLayerProps(restProps, 'lc-tile-image')]
		);

		$.append($$anchor, fragment_1);
	});

	var node_1 = $.sibling(node);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = root_1();
			var rect = $.first_child(fragment_2);
			var node_2 = $.sibling(rect);

			{
				let $0 = $.derived(() => ($$props.x + $$props.tx) * $$props.scale);
				let $1 = $.derived(() => ($$props.y + $$props.ty) * $$props.scale);

				$.component(node_2, () => $$props.Text, ($$anchor, Text_1) => {
					Text_1($$anchor, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get($1);
						},
						verticalAnchor: 'start',
						dx: 2,
						dy: -2,
						get value() {
							return `${$$props.x ?? ''}-${$$props.y ?? ''}-${$$props.z ?? ''}`;
						},
						class: 'lc-tile-image-debug-text'
					});
				});
			}

			$.template_effect(() => {
				$.set_attribute(rect, 'x', ($$props.x + $$props.tx) * $$props.scale);
				$.set_attribute(rect, 'y', ($$props.y + $$props.ty) * $$props.scale);
				$.set_attribute(rect, 'width', $$props.scale);
				$.set_attribute(rect, 'height', $$props.scale);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if (debug()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}