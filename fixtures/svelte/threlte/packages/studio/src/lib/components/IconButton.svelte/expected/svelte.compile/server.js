import * as $ from 'svelte/internal/server';
import Icon from './Icon.svelte';

export default function IconButton($$renderer, $$props) {
	let {
		icon,
		label,
		activityColor = 'transparent',
		active = false,
		warn = false,
		success = false,
		disabled = false,
		error = false,
		onclick,
		$$slots,
		$$events,
		...rest
	} = $$props;

	const activityColors = {
		red: '#dc2626',
		orange: '#f97316',
		green: '#16a34a',
		transparent: 'transparent'
	};

	const backgroundColors = {
		active: '#2563eb',
		warn: '#f97316',
		success: '#16a34a',
		default: 'var(--btn-bg);',
		error: '#dc2626'
	};

	const backgroundColorsHover = {
		active: '#1d4ed8',
		warn: '#ea580c',
		success: '#15803d',
		default: 'var(--btn-bg-h)',
		error: '#D03838'
	};

	const backgroundColorsFocus = {
		active: '#1d4ed8',
		warn: '#ea580c',
		success: '#15803d',
		default: 'var(--btn-bg-f);',
		error: '#C73030'
	};

	const backgroundColorsActive = {
		active: '#1d4ed8',
		warn: '#ea580c',
		success: '#15803d',
		default: 'var(--btn-bg-a);',
		error: '#C73030'
	};

	const textColor = {
		active: 'white',
		warn: 'white',
		success: 'white',
		default: 'black',
		error: 'white'
	};

	let state = $.derived(() => error
		? 'error'
		: warn
			? 'warn'
			: success ? 'success' : active ? 'active' : 'default');

	let colors = $.derived(() => ({
		activityColor: activityColors[activityColor],
		backgroundColor: backgroundColors[state()],
		backgroundColorHover: backgroundColorsHover[state()],
		backgroundColorFocus: backgroundColorsFocus[state()],
		backgroundColorActive: backgroundColorsActive[state()],
		textColor: textColor[state()]
	}));

	$$renderer.push(`<button${$.attributes(
		{
			'aria-label': label,
			style: `--activityColor: ${$.stringify(colors().activityColor)}; --background-color: ${$.stringify(colors().backgroundColor)}; --background-color-hover: ${$.stringify(colors().backgroundColorHover)}; --background-color-focus: ${$.stringify(colors().backgroundColorFocus)}; --background-color-active: ${$.stringify(colors().backgroundColorActive)}; --text-color: ${$.stringify(colors().textColor)};`,
			disabled,
			...rest
		},
		'svelte-19pn2e'
	)}>`);

	Icon($$renderer, { size: '15', name: icon });
	$$renderer.push(`<!----></button>`);
}