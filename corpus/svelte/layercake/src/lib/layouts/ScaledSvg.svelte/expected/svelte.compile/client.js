import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_svg(`<title><!></title>`);
var root_1 = $.from_svg(`<title> </title>`);
var root_2 = $.from_svg(`<defs><!></defs>`);
var root_3 = $.from_svg(`<svg preserveAspectRatio="none" class="svelte-r99skn"><!><!><!></svg>`);

export default function ScaledSvg($$anchor, $$props) {
	$.push($$props, true);

	const $padding = () => $.store_get(padding, '$padding', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { padding } = getContext('LayerCake');

	/**
	 * @typedef {Object} Props
	 * @property {SVGElement|undefined} [element] The layout's `<svg>` element. A useful prop to bind to.
	 * @property {number|undefined} [zIndex] Set the layout's z-index.
	 * @property {boolean|undefined} [pointerEvents] Set this to `false` to set `pointer-events: none;` on all of this layout's layers.
	 * @property {number} [fixedAspectRatio] A number to set the aspect ratio onto the viewBox: `0 0 100 ${100 / fixedAspectRatio}`
	 * @property {string|undefined} [viewBox] By default, the viewbox is `0 0 100 ${100 / fixedAspectRatio}` but override that and set it to something custom here
	 * @property {string|undefined} [label] A string passed to the `aria-label` on the `<svg>` element.
	 * @property {string|undefined} [labelledBy] A string passed to the `aria-labelledby` on the `<svg>` element.
	 * @property {string|undefined} [describedBy] A string passed to `aria-describedby` property on the `<svg>` element.
	 * @property {string|undefined} [titleText] Shorthand to set the contents of `<title></title>` for accessibility. You can also set arbitrary HTML via the "title" slot but this is a convenient shorthand. If you use the "title" slot, this prop is ignored.
	 * @property {'visible'|'hidden'} [overflow='visible'] Set the overflow property on the `<svg>` element. Defaults to `'visible'`.
	 * @property {import('svelte').Snippet} [title] A snippet to render inside the `<title>` tag for accessibility. If you use this, the `titleText` prop is ignored.
	 * @property {import('svelte').Snippet} [defs] A snippet to render inside the `<defs>` tag for accessibility.
	 * @property {import('svelte').Snippet<[{ element: SVGElement | undefined }]>} [children]
	 */
	/** @type {Props} */
	let element = $.prop($$props, 'element', 15, undefined),
		zIndex = $.prop($$props, 'zIndex', 3, undefined),
		pointerEvents = $.prop($$props, 'pointerEvents', 3, undefined),
		fixedAspectRatio = $.prop($$props, 'fixedAspectRatio', 3, 1),
		viewBox = $.prop($$props, 'viewBox', 3, undefined),
		label = $.prop($$props, 'label', 3, undefined),
		labelledBy = $.prop($$props, 'labelledBy', 3, undefined),
		describedBy = $.prop($$props, 'describedBy', 3, undefined),
		titleText = $.prop($$props, 'titleText', 3, undefined),
		title = $.prop($$props, 'title', 3, undefined),
		defs = $.prop($$props, 'defs', 3, undefined),
		overflow = $.prop($$props, 'overflow', 3, 'visible');

	var svg = root_3();
	let styles;
	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var title_1 = root();
			var node_1 = $.child(title_1);

			$.snippet(node_1, title);
			$.reset(title_1);
			$.append($$anchor, title_1);
		};

		var consequent_1 = ($$anchor) => {
			var title_2 = root_1();
			var text = $.only_child(title_2, true);

			$.template_effect(() => $.set_text(text, titleText()));
			$.append($$anchor, title_2);
		};

		$.if(node, ($$render) => {
			if (typeof title() === 'function') $$render(consequent); else if (titleText()) $$render(consequent_1, 1);
		});
	}

	var node_2 = $.sibling(node);

	{
		var consequent_2 = ($$anchor) => {
			var defs_1 = root_2();
			var node_3 = $.child(defs_1);

			$.snippet(node_3, defs);
			$.reset(defs_1);
			$.append($$anchor, defs_1);
		};

		$.if(node_2, ($$render) => {
			if (typeof defs() === 'function') $$render(consequent_2);
		});
	}

	var node_4 = $.sibling(node_2);

	$.snippet(node_4, () => $$props.children ?? $.noop, () => ({ element: element() }));
	$.reset(svg);
	$.bind_this(svg, ($$value) => element($$value), () => element());

	$.template_effect(() => {
		$.set_attribute(svg, 'viewBox', viewBox() || `0 0 100 ${100 / fixedAspectRatio()}`);

		styles = $.set_style(svg, 'right:0px; bottom:0px;', styles, {
			'z-index': zIndex(),
			'pointer-events': pointerEvents() === false ? 'none' : null,
			top: $padding().top + 'px',
			left: $padding().left + 'px',
			width: `calc(100% - ${$padding().left + $padding().right}px)`,
			height: `calc(100% - ${$padding().top + $padding().bottom}px)`,
			overflow: overflow()
		});

		$.set_attribute(svg, 'aria-label', label());
		$.set_attribute(svg, 'aria-labelledby', labelledBy());
		$.set_attribute(svg, 'aria-describedby', describedBy());
	});

	$.append($$anchor, svg);
	$.pop();
	$$cleanup();
}