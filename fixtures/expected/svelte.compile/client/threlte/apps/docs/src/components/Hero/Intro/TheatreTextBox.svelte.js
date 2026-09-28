import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createSheetObjectAction } from '@threlte/theatre';
import Reveal from '../Reveal.svelte';
import FadeOut from '../FadeOut.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'key', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function TheatreTextBox($$anchor, $$props) {
	$.push($$props, true);

	const sheetObject = createSheetObjectAction();
	let rest = $.rest_props($$props, rest_excludes);
	let reveal = $.state(0);
	let fade = $.state(0);
	var div = root();

	$.attribute_effect(div, () => ({ ...rest }));

	var node_1 = $.child(div);

	Reveal(node_1, {
		get progress() {
			return $.get(reveal);
		},

		children: ($$anchor, $$slotProps) => {
			FadeOut($$anchor, {
				get progress() {
					return $.get(fade);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.action(div, ($$node, $$action_arg) => sheetObject?.($$node, $$action_arg), () => ({
		key: $$props.key,
		props: { opacity: 1, translateX: 0, translateY: 0, reveal: 0, fade: 0 },
		callback(node, props) {
			node.style.opacity = props.opacity;
			node.style.transform = `translate(${props.translateX}px, ${props.translateY}px)`;
			$.set(reveal, props.reveal, true);
			$.set(fade, props.fade, true);
		}
	}));

	$.append($$anchor, div);
	$.pop();
}