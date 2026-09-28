import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div style="position:relative;display:inline-block;"><div><!></div></div>`);

export default function Magnet($$anchor, $$props) {
	$.push($$props, true);

	let padding = $.prop($$props, 'padding', 3, 100),
		disabled = $.prop($$props, 'disabled', 3, false),
		magnetStrength = $.prop($$props, 'magnetStrength', 3, 2),
		activeTransition = $.prop($$props, 'activeTransition', 3, 'transform 0.3s ease-out'),
		inactiveTransition = $.prop($$props, 'inactiveTransition', 3, 'transform 0.5s ease-in-out'),
		wrapperClass = $.prop($$props, 'wrapperClass', 3, ''),
		innerClass = $.prop($$props, 'innerClass', 3, '');

	let magnetEl;
	let active = $.state(false);
	let pos = $.state($.proxy({ x: 0, y: 0 }));

	$.user_effect(() => {
		if (disabled()) {
			$.set(pos, { x: 0, y: 0 }, true);
			$.set(active, false);

			return;
		}

		const handle = (e) => {
			if (!magnetEl) return;

			const { left, top, width, height } = magnetEl.getBoundingClientRect();
			const cx = left + width / 2;
			const cy = top + height / 2;
			const dx = Math.abs(cx - e.clientX);
			const dy = Math.abs(cy - e.clientY);

			if (dx < width / 2 + padding() && dy < height / 2 + padding()) {
				$.set(active, true);

				$.set(
					pos,
					{
						x: (e.clientX - cx) / magnetStrength(),
						y: (e.clientY - cy) / magnetStrength()
					},
					true
				);
			} else {
				$.set(active, false);
				$.set(pos, { x: 0, y: 0 }, true);
			}
		};

		window.addEventListener('mousemove', handle);

		return () => window.removeEventListener('mousemove', handle);
	});

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => magnetEl = $$value, () => magnetEl);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx(wrapperClass()));
		$.set_class(div_1, 1, $.clsx(innerClass()));
		$.set_style(div_1, `transform:translate3d(${$.get(pos).x ?? ''}px,${$.get(pos).y ?? ''}px,0);transition:${($.get(active) ? activeTransition() : inactiveTransition()) ?? ''};will-change:transform;`);
	});

	$.append($$anchor, div);
	$.pop();
}