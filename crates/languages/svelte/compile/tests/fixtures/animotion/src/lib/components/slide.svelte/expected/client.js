import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<section><!></section>`);

export default function Slide($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

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

	var section = root();
	var node = $.child(section);

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

	$.reset(section);
	$.attach(section, () => listeners);

	$.template_effect(() => {
		$.set_attribute(section, 'data-auto-animate', $$props.animate);
		$.set_attribute(section, 'data-auto-animate-easing', $$props.animateEasing);
		$.set_attribute(section, 'data-auto-animate-unmatched', $$props.animateUnmatched);
		$.set_attribute(section, 'data-auto-animate-id', $$props.animateId);
		$.set_attribute(section, 'data-auto-animate-restart', $$props.animateRestart);
		$.set_attribute(section, 'data-autoslide', $$props.stepDuration);
		$.set_attribute(section, 'data-background-color', $$props.background);
		$.set_attribute(section, 'data-background-gradient', $$props.gradient);
		$.set_attribute(section, 'data-background-image', $$props.image);
		$.set_attribute(section, 'data-background-video', $$props.video);
		$.set_attribute(section, 'data-background-iframe', $$props.iframe);
		$.set_attribute(section, 'data-background-interactive', $$props.interactive);
		$.set_attribute(section, 'data-transition', $$props.transition);
		$.set_class(section, 1, $.clsx($$props.class));
	});

	$.append($$anchor, section);
	$.pop();
}