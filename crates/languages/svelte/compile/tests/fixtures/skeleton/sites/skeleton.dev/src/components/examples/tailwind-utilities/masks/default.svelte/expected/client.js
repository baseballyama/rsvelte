import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, tick } from 'svelte';

var root = $.from_html(`<img src="https://i.pravatar.cc/150?img=48" alt="Avatar"/>`);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	const shapes = [
		'circle',
		'squircle',
		'triangle-up',
		'triangle-down',
		'triangle-right',
		'triangle-left',
		'diamond',
		'pentagon',
		'hexagon',
		'cube',
		'octagon',
		'decagon',
		'star',
		'heart',
		'cross'
	];

	let index = $.state(0);

	const intervalId = setInterval(
		() => {
			const update = async () => {
				$.set(index, ($.get(index) + 1) % shapes.length);
				await tick();
			};

			if (typeof document !== 'undefined' && 'startViewTransition' in document) {
				document.startViewTransition(update);
			} else {
				update();
			}
		},
		2000
	);

	onDestroy(() => clearInterval(intervalId));

	var img = root();

	$.set_style(img, '', {}, { 'view-transition-name': 'mask-default' });
	$.template_effect(() => $.set_class(img, 1, `mask mask-${shapes[$.get(index)] ?? ''} w-32`));
	$.append($$anchor, img);
	$.pop();
}