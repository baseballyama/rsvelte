import * as $ from 'svelte/internal/server';

export default function GlitchText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text,
			speed = 0.5,
			enableShadows = true,
			enableOnHover = false,
			class: svelteClass = '',
			className = ''
		} = $$props;

		const afterDuration = $.derived(() => `${speed * 3}s`);
		const beforeDuration = $.derived(() => `${speed * 2}s`);
		const afterShadow = $.derived(() => enableShadows ? '-5px 0 red' : 'none');
		const beforeShadow = $.derived(() => enableShadows ? '5px 0 cyan' : 'none');
		const classes = $.derived(() => `glitch ${enableOnHover ? 'enable-on-hover' : ''} ${svelteClass} ${className}`.trim());

		$$renderer.push(`<div${$.attr_class($.clsx(classes()), 'svelte-1tsi7sm')}${$.attr('data-text', text)}${$.attr_style('', {
			'--after-duration': afterDuration(),
			'--before-duration': beforeDuration(),
			'--after-shadow': afterShadow(),
			'--before-shadow': beforeShadow()
		})}>${$.escape(text)}</div>`);
	});
}