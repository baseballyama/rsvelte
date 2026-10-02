import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createSheetObjectAction, useSequence } from '@threlte/theatre';

var root = $.from_html(`<div class="svelte-awn0pb"><button class="svelte-awn0pb"> </button></div>`);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $playing = () => $.store_get(playing, '$playing', $$stores);
	const $position = () => $.store_get(position, '$position', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const sheetObjectAction = createSheetObjectAction();
	const { position, playing, pause, play } = useSequence();
	const toggle = () => $playing() ? pause() : play();
	var div = root();
	var button = $.child(div);
	var text = $.only_child(button);

	$.effect(() => $.event('click', button, toggle));

	$.action(button, ($$node, $$action_arg) => sheetObjectAction?.($$node, $$action_arg), () => ({
		key: 'button',
		props: { x: 0, y: 0, bold: false },
		callback: (node, { x, y, bold }) => {
			node.style.transform = `translateX(${x}px) translateY(${y}px)`;
			node.style.fontWeight = bold ? 'bold' : 'normal';
		}
	}));

	$.reset(div);

	$.template_effect(
		($0) => $.set_text(text, `Click Me!
    ${$0 ?? ''}`),
		[() => $position().toFixed(2)]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}