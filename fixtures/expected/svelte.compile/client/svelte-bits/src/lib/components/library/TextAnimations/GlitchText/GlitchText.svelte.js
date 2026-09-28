import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function GlitchText($$anchor, $$props) {
	$.push($$props, true);

	let speed = $.prop($$props, 'speed', 3, 0.5),
		enableShadows = $.prop($$props, 'enableShadows', 3, true),
		enableOnHover = $.prop($$props, 'enableOnHover', 3, false),
		svelteClass = $.prop($$props, 'class', 3, ''),
		className = $.prop($$props, 'className', 3, '');

	const afterDuration = $.derived(() => `${speed() * 3}s`);
	const beforeDuration = $.derived(() => `${speed() * 2}s`);
	const afterShadow = $.derived(() => enableShadows() ? '-5px 0 red' : 'none');
	const beforeShadow = $.derived(() => enableShadows() ? '5px 0 cyan' : 'none');
	const classes = $.derived(() => `glitch ${enableOnHover() ? 'enable-on-hover' : ''} ${svelteClass()} ${className()}`.trim());
	var div = root();
	let styles;
	var text_1 = $.only_child(div, true);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx($.get(classes)), 'svelte-1tsi7sm');
		$.set_attribute(div, 'data-text', $$props.text);

		styles = $.set_style(div, '', styles, {
			'--after-duration': $.get(afterDuration),
			'--before-duration': $.get(beforeDuration),
			'--after-shadow': $.get(afterShadow),
			'--before-shadow': $.get(beforeShadow)
		});

		$.set_text(text_1, $$props.text);
	});

	$.append($$anchor, div);
	$.pop();
}