import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="presentation"><div></div> <!></div>`);

export default function GlareHover($$anchor, $$props) {
	$.push($$props, true);

	let width = $.prop($$props, 'width', 3, '500px'),
		height = $.prop($$props, 'height', 3, '500px'),
		background = $.prop($$props, 'background', 3, '#000'),
		borderRadius = $.prop($$props, 'borderRadius', 3, '10px'),
		borderColor = $.prop($$props, 'borderColor', 3, '#333'),
		glareColor = $.prop($$props, 'glareColor', 3, '#ffffff'),
		glareOpacity = $.prop($$props, 'glareOpacity', 3, 0.5),
		glareAngle = $.prop($$props, 'glareAngle', 19, () => -45),
		glareSize = $.prop($$props, 'glareSize', 3, 250),
		transitionDuration = $.prop($$props, 'transitionDuration', 3, 650),
		playOnce = $.prop($$props, 'playOnce', 3, false),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	const rgba = $.derived(() => {
		const hex = glareColor().replace('#', '');

		if ((/^[\dA-Fa-f]{6}$/).test(hex)) {
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);

			return `rgba(${r}, ${g}, ${b}, ${glareOpacity()})`;
		}

		if ((/^[\dA-Fa-f]{3}$/).test(hex)) {
			const r = parseInt(hex[0] + hex[0], 16);
			const g = parseInt(hex[1] + hex[1], 16);
			const b = parseInt(hex[2] + hex[2], 16);

			return `rgba(${r}, ${g}, ${b}, ${glareOpacity()})`;
		}

		return glareColor();
	});

	let overlay;

	function animateIn() {
		if (!overlay) return;

		overlay.style.transition = 'none';
		overlay.style.backgroundPosition = '-100% -100%, 0 0';

		// force reflow
		void overlay.offsetWidth;

		overlay.style.transition = `${transitionDuration()}ms ease`;
		overlay.style.backgroundPosition = '100% 100%, 0 0';
	}

	function animateOut() {
		if (!overlay) return;

		if (playOnce()) {
			overlay.style.transition = 'none';
			overlay.style.backgroundPosition = '-100% -100%, 0 0';
		} else {
			overlay.style.transition = `${transitionDuration()}ms ease`;
			overlay.style.backgroundPosition = '-100% -100%, 0 0';
		}
	}

	var div = root();
	var div_1 = $.child(div);

	$.bind_this(div_1, ($$value) => overlay = $$value, () => overlay);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `relative grid place-items-center overflow-hidden border cursor-pointer ${className() ?? ''}`);
		$.set_style(div, `width:${width() ?? ''};height:${height() ?? ''};background:${background() ?? ''};border-radius:${borderRadius() ?? ''};border-color:${borderColor() ?? ''};${style() ?? ''}`);
		$.set_style(div_1, `position:absolute;inset:0;background:linear-gradient(${glareAngle() ?? ''}deg, hsla(0,0%,0%,0) 60%, ${$.get(rgba) ?? ''} 70%, hsla(0,0%,0%,0) 100%);background-size:${glareSize() ?? ''}% ${glareSize() ?? ''}%, 100% 100%;background-repeat:no-repeat;background-position:-100% -100%, 0 0;pointer-events:none;`);
	});

	$.event('mouseenter', div, animateIn);
	$.event('mouseleave', div, animateOut);
	$.append($$anchor, div);
	$.pop();
}