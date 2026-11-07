import * as $ from 'svelte/internal/server';

export default function Slide($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...props } = $$props;

		function listeners(el) {
			const events = ['in', 'out'];

			const handlers = events.map((event) => {
				const handler = () => props[event]?.();

				el.addEventListener(event, handler);

				return { event, handler };
			});

			return () => {
				handlers.forEach(({ event, handler }) => el.removeEventListener(event, handler));
			};
		}

		$$renderer.push(`<section${$.attr('data-auto-animate', props.animate)}${$.attr('data-auto-animate-easing', props.animateEasing)}${$.attr('data-auto-animate-unmatched', props.animateUnmatched)}${$.attr('data-auto-animate-id', props.animateId)}${$.attr('data-auto-animate-restart', props.animateRestart)}${$.attr('data-autoslide', props.stepDuration)}${$.attr('data-background-color', props.background)}${$.attr('data-background-gradient', props.gradient)}${$.attr('data-background-image', props.image)}${$.attr('data-background-video', props.video)}${$.attr('data-background-iframe', props.iframe)}${$.attr('data-background-interactive', props.interactive)}${$.attr('data-transition', props.transition)}${$.attr_class($.clsx(props.class))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section>`);
	});
}