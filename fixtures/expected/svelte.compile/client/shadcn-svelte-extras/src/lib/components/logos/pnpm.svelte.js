import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><defs><path d="M237.6 95L187.6 95L187.6 45L237.6 45L237.6 95Z" id="b45vdTD8hs"></path><path d="M182.59 95L132.59 95L132.59 45L182.59 45L182.59 95Z" id="a40WtxIl8d"></path><path d="M127.59 95L77.59 95L77.59 45L127.59 45L127.59 95Z" id="h2CN9AEEpe"></path><path d="M237.6 150L187.6 150L187.6 100L237.6 100L237.6 150Z" id="dqv5133G8"></path><path d="M182.59 150L132.59 150L132.59 100L182.59 100L182.59 150Z" id="b1Lv79ypvm"></path><path d="M182.59 205L132.59 205L132.59 155L182.59 155L182.59 205Z" id="hy1IZWwLX"></path><path d="M237.6 205L187.6 205L187.6 155L237.6 155L237.6 205Z" id="akQfjxQes"></path><path d="M127.59 205L77.59 205L77.59 155L127.59 155L127.59 205Z" id="bdSrwE5pk"></path></defs><g><use href="#b45vdTD8hs" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#a40WtxIl8d" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#h2CN9AEEpe" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#dqv5133G8" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#b1Lv79ypvm" opacity="1" fill="#ffffff" fill-opacity="1"></use></g><g><use href="#hy1IZWwLX" opacity="1" fill="#ffffff" fill-opacity="1"></use></g><g><use href="#akQfjxQes" opacity="1" fill="#ffffff" fill-opacity="1"></use></g><g><use href="#bdSrwE5pk" opacity="1" fill="#ffffff" fill-opacity="1"></use></g></svg><svg><defs><path d="M237.6 95L187.6 95L187.6 45L237.6 45L237.6 95Z" id="arNRoK435"></path><path d="M182.59 95L132.59 95L132.59 45L182.59 45L182.59 95Z" id="a3H2WU7Px"></path><path d="M127.59 95L77.59 95L77.59 45L127.59 45L127.59 95Z" id="b1DInM56vl"></path><path d="M237.6 150L187.6 150L187.6 100L237.6 100L237.6 150Z" id="a7LFlgQIwu"></path><path d="M182.59 150L132.59 150L132.59 100L182.59 100L182.59 150Z" id="amwLiZcuo"></path><path d="M182.59 205L132.59 205L132.59 155L182.59 155L182.59 205Z" id="f3Peu5RWan"></path><path d="M237.6 205L187.6 205L187.6 155L237.6 155L237.6 205Z" id="a6DXBfqPa"></path><path d="M127.59 205L77.59 205L77.59 155L127.59 155L127.59 205Z" id="c1GWSTH1z7"></path></defs><g><use href="#arNRoK435" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#a3H2WU7Px" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#b1DInM56vl" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#a7LFlgQIwu" opacity="1" fill="#f9ad00" fill-opacity="1"></use></g><g><use href="#amwLiZcuo" opacity="1" fill="#4e4e4e" fill-opacity="1"></use></g><g><use href="#f3Peu5RWan" opacity="1" fill="#4e4e4e" fill-opacity="1"></use></g><g><use href="#a6DXBfqPa" opacity="1" fill="#4e4e4e" fill-opacity="1"></use></g><g><use href="#c1GWSTH1z7" opacity="1" fill="#4e4e4e" fill-opacity="1"></use></g></svg>`, 1);

export default function Pnpm($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var svg = $.first_child(fragment);

	$.attribute_effect(
		svg,
		($0) => ({
			...restProps,
			class: $0,
			viewBox: '76.58987244897958 44 164.00775510204068 164',
			preserveAspectRatio: 'xMidYMid meet',
			xmlns: 'http://www.w3.org/2000/svg'
		}),
		[() => cn('hidden dark:inline', $$props.class)]
	);

	var svg_1 = $.sibling(svg);

	$.attribute_effect(
		svg_1,
		($0) => ({
			...restProps,
			class: $0,
			viewBox: '76.58987244897958 44 164.00775510204068 164',
			preserveAspectRatio: 'xMidYMid meet',
			xmlns: 'http://www.w3.org/2000/svg'
		}),
		[() => cn('inline dark:hidden', $$props.class)]
	);

	$.append($$anchor, fragment);
	$.pop();
}