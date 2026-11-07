import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><defs><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="9" y1="16.97" x2="9" y2="1.03" gradientTransform="scale(7.11111)"><stop offset="0" stop-color="#0078d4"></stop><stop offset=".16" stop-color="#1380da"></stop><stop offset=".53" stop-color="#3c91e5"></stop><stop offset=".82" stop-color="#559cec"></stop><stop offset="1" stop-color="#5ea0ef"></stop></linearGradient></defs><path fill="url(#a)" d="M120.89 28.445v69.262l-28.445 23.324-44.09-16.07v15.93L23.395 88.25l72.746 5.688V31.574ZM96.64 31.93 55.82 7.11v16.285L18.348 34.418 7.109 48.852v32.785l16.075 7.11V46.718Zm0 0"></path></svg>`);

export default function Azure_devops($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			class: $0,
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 128 128',
			...rest
		}),
		[() => cn('size-4', $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}