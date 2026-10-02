import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pannable } from './pannable.js';
import { spring } from 'svelte/motion';

var root = $.from_html(`<div class="box svelte-5edke9"></div>`);

export default function Actions_input($$anchor, $$props) {
	$.push($$props, true);

	const $coords = () => $.store_get(coords, '$coords', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const coords = spring({ x: 0, y: 0 }, { stiffness: 0.2, damping: 0.4 });

	function handlePanStart() {
		coords.stiffness = coords.damping = 1;
	}

	function handlePanMove(event) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
	}

	function handlePanEnd(event) {
		coords.stiffness = 0.2;
		coords.damping = 0.4;
		coords.set({ x: 0, y: 0 });
	}

	var div = root();

	$.action(div, ($$node) => pannable?.($$node));
	$.effect(() => $.event('panstart', div, handlePanStart));
	$.effect(() => $.event('panmove', div, handlePanMove));
	$.effect(() => $.event('panend', div, handlePanEnd));

	$.template_effect(() => $.set_style(div, `transform:
		translate(${$coords().x ?? ''}px,${$coords().y ?? ''}px)
		rotate(${$coords().x * 0.2}deg)`));

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}