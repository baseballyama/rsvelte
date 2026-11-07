import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Confetti from "$lib/Confetti.svelte";

var root = $.from_html(`<div class="mover svelte-1soaze9"><!></div>`);
var root_1 = $.from_html(`<div class="box svelte-1soaze9"><span class="svelte-1soaze9">Click in me</span> <!></div>`);

export default function ConfettiOnClick($$anchor, $$props) {
	$.push($$props, true);

	const duration = 2000;
	let things = [];
	let timeout;

	async function moveConfetti(event) {
		const { target, clientX, clientY } = event;
		const elementY = target.getBoundingClientRect().top;
		const elementX = target.getBoundingClientRect().left;
		const x = clientX - elementX;
		const y = clientY - elementY;

		things = [...things, { x, y }];
		clearTimeout(timeout);
		timeout = setTimeout(() => things = [], duration);
	}

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	$.each(node, 17, () => things, $.index, ($$anchor, thing) => {
		var div_1 = root();
		var node_1 = $.child(div_1);

		Confetti(node_1, { y: [-0.5, 0.5], fallDistance: '20px', amount: '10', duration });
		$.reset(div_1);
		$.template_effect(() => $.set_style(div_1, `left: ${$.get(thing).x ?? ''}px; top: ${$.get(thing).y ?? ''}px`));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.event('click', div, moveConfetti);
	$.append($$anchor, div);
	$.pop();
}