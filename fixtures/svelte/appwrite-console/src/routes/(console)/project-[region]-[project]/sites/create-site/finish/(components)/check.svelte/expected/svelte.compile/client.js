import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicInOut } from 'svelte/easing';
import { draw, fade } from 'svelte/transition';

var root = $.from_html(`<div class="svelte-19fk4mc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" class="svelte-19fk4mc"><g filter="url(#a)" class="svelte-19fk4mc"><circle cx="10" cy="10" r="8" fill="var(--bgcolor-accent)" fill-opacity=".08" class="svelte-19fk4mc"></circle><circle cx="10" cy="10" r="8" stroke="var(--bgcolor-accent)" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".32" stroke-width="1.2" class="svelte-19fk4mc"></circle></g><path stroke="var(--fgcolor-accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="m6.25 11.5 2.5 2 5-6.5" class="svelte-19fk4mc"></path><defs class="svelte-19fk4mc"><filter id="a" width="25.199" height="25.203" x="-2.6" y="-2.602" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" class="svelte-19fk4mc"><feFlood flood-opacity="0" result="BackgroundImageFix" class="svelte-19fk4mc"></feFlood><feGaussianBlur in="BackgroundImageFix" stdDeviation="2" class="svelte-19fk4mc"></feGaussianBlur><feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_1449_7567" class="svelte-19fk4mc"></feComposite><feBlend in="SourceGraphic" in2="effect1_backgroundBlur_1449_7567" result="shape" class="svelte-19fk4mc"></feBlend></filter></defs></svg></div>`);

export default function Check($$anchor) {
	var div = root();

	$.set_style(div, '', {}, { width: '40px', height: '40px' });

	var svg = $.child(div);
	var g = $.child(svg);

	$.set_style(g, '', {}, {
		'animation-name': 'rotate',
		'animation-duration': '1.5s',
		'animation-iteration-count': 'infinite',
		'transform-origin': 'center'
	});

	var circle = $.child(g);
	var circle_1 = $.sibling(circle);

	$.set_style(circle_1, '', {}, { rotate: '-90deg', 'transform-origin': 'center' });
	$.reset(g);

	var path = $.sibling(g);

	$.next();
	$.reset(svg);
	$.reset(div);
	$.transition(1, circle, () => fade, () => ({ duration: 250, delay: 1000 }));
	$.transition(1, circle_1, () => draw, () => ({ duration: 1250, easing: cubicInOut }));
	$.transition(1, path, () => draw, () => ({ duration: 1000 }));
	$.append($$anchor, div);
}