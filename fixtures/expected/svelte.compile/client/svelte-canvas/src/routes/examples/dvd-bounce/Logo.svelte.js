import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';
import { onMount, untrack } from 'svelte';
import Logo from './DVD_logo.svg?raw';

export default function Logo_1($$anchor, $$props) {
	$.push($$props, true);

	let logo = $.state(void 0);

	onMount(() => {
		$.set(logo, new Image(), true);
		$.get(logo).src = `data:image/svg+xml,${encodeURIComponent(Logo)}`;
	});

	let x = $.state(0);
	let y = $.state(0);
	let xflip = $.state(1);
	let yflip = $.state(1);
	let colorIndex = $.state(0);
	const colors = ['tomato', 'goldenrod', 'mediumturquoise'];

	const render = ({ context, width, height }) => {
		untrack(() => {
			const w = Math.min(210, width / 3);
			const h = w / 2;

			if ($.set(x, $.get(x) + 5 * $.get(xflip)) <= 0 || $.get(x) + w >= width) {
				$.set(xflip, $.get(xflip) * -1);
				$.update(colorIndex);
			}

			if ($.set(y, $.get(y) + 5 * $.get(yflip)) <= 0 || $.get(y) + h >= height) {
				$.set(yflip, $.get(yflip) * -1);
				$.update(colorIndex);
			}

			context.fillStyle = colors[$.get(colorIndex) % colors.length];
			context.fillRect(0, 0, width, height);
			context.globalCompositeOperation = 'destination-in';
			context.drawImage($.get(logo), $.get(x), $.get(y), w, h);
		});
	};

	Layer($$anchor, { render });
	$.pop();
}