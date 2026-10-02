import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img class="svelte-1a4we9h"/>`);
var root_1 = $.from_html(`<a class="parallax-container svelte-1a4we9h" href="https://www.firewatchgame.com"></a> <div class="text svelte-1a4we9h"><span class="svelte-1a4we9h">scroll down</span> <div class="foreground svelte-1a4we9h"> </div></div>`, 1);

export default function Svelte_window_bindings_input($$anchor) {
	const layers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	let y;
	var fragment = root_1();
	var a = $.first_child(fragment);

	$.each(a, 21, () => layers, $.index, ($$anchor, layer) => {
		var img = root();

		$.template_effect(() => {
			$.set_style(img, `transform: translate(0,${-y * $.get(layer) / (layers.length - 1)}px)`);
			$.set_attribute(img, 'src', `https://www.firewatchgame.com/images/parallax/parallax${$.get(layer) ?? ''}.png`);
			$.set_attribute(img, 'alt', `parallax layer ${$.get(layer) ?? ''}`);
		});

		$.append($$anchor, img);
	});

	$.reset(a);

	var div = $.sibling(a, 2);
	var span = $.child(div);
	var div_1 = $.sibling(span, 2);
	var text = $.only_child(div_1);

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_style(span, `opacity: ${$0 ?? ''}`);
			$.set_text(text, `You have scrolled ${y ?? ''} pixels`);
		},
		[() => 1 - Math.max(0, y / 40)]
	);

	$.bind_window_scroll('y', () => y, ($$value) => y = $$value);
	$.append($$anchor, fragment);
}