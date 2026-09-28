import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { animate } from 'motion';

var root = $.from_html(`<div class="absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]"><div class="absolute bg-black rounded-[1.25rem] z-[-1]" style="width:calc(100% - 2px);height:calc(100% - 2px);left:50%;top:50%;transform:translate(-50%,-50%);"></div></div>`);
var root_1 = $.from_html(`<div role="presentation"><!> <div class="inline-block relative z-2 text-transparent bg-clip-text"><!></div></div>`);

export default function GradientText($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		colors = $.prop($$props, 'colors', 19, () => ['#FF8A4C', '#FFC18A', '#FF6B2C']),
		animationSpeed = $.prop($$props, 'animationSpeed', 3, 8),
		showBorder = $.prop($$props, 'showBorder', 3, false),
		direction = $.prop($$props, 'direction', 3, 'horizontal'),
		pauseOnHover = $.prop($$props, 'pauseOnHover', 3, false),
		yoyo = $.prop($$props, 'yoyo', 3, true);

	let progress = $.state(0);
	let isPaused = $.state(false);

	$.user_effect(() => {
		// reset on speed/yoyo change
		void animationSpeed();

		void yoyo();
		$.set(progress, 0);
	});

	$.user_effect(() => {
		const animationDuration = animationSpeed() * 1000;
		let elapsed = 0;
		let last = null;
		let raf = 0;

		const tick = (time) => {
			if ($.get(isPaused)) {
				last = null;
				raf = requestAnimationFrame(tick);

				return;
			}

			if (last === null) {
				last = time;
				raf = requestAnimationFrame(tick);

				return;
			}

			const dt = time - last;

			last = time;
			elapsed += dt;

			if (yoyo()) {
				const fullCycle = animationDuration * 2;
				const cycleTime = elapsed % fullCycle;

				if (cycleTime < animationDuration) {
					$.set(progress, cycleTime / animationDuration * 100);
				} else {
					$.set(progress, 100 - (cycleTime - animationDuration) / animationDuration * 100);
				}
			} else {
				$.set(progress, elapsed / animationDuration * 100);
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});

	// Reference `animate` so the dep import is not tree-shaken (kept available for users who extend)
	void animate;

	const gradientAngle = $.derived(() => direction() === 'horizontal'
		? 'to right'
		: direction() === 'vertical' ? 'to bottom' : 'to bottom right');

	const gradientColors = $.derived(() => [...colors(), colors()[0]].join(', '));
	const backgroundImage = $.derived(() => `linear-gradient(${$.get(gradientAngle)}, ${$.get(gradientColors)})`);

	const backgroundSize = $.derived(() => direction() === 'horizontal'
		? '300% 100%'
		: direction() === 'vertical' ? '100% 300%' : '300% 300%');

	const backgroundPosition = $.derived(() => direction() === 'vertical' ? `50% ${$.get(progress)}%` : `${$.get(progress)}% 50%`);
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			let styles;

			$.template_effect(() => styles = $.set_style(div_1, '', styles, {
				'background-image': $.get(backgroundImage),
				'background-size': $.get(backgroundSize),
				'background-repeat': 'repeat',
				'background-position': $.get(backgroundPosition)
			}));

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (showBorder()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	let styles_1;
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer ${showBorder() ? 'py-1 px-2' : ''} ${className() ?? ''}`);

		styles_1 = $.set_style(div_2, '', styles_1, {
			'background-image': $.get(backgroundImage),
			'background-size': $.get(backgroundSize),
			'background-repeat': 'repeat',
			'background-position': $.get(backgroundPosition),
			'-webkit-background-clip': 'text'
		});
	});

	$.event('mouseenter', div, () => pauseOnHover() && $.set(isPaused, true));
	$.event('mouseleave', div, () => pauseOnHover() && $.set(isPaused, false));
	$.append($$anchor, div);
	$.pop();
}