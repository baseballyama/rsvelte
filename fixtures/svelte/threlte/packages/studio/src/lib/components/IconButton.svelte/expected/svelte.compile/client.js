import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from './Icon.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'icon',
	'label',
	'activityColor',
	'active',
	'warn',
	'success',
	'disabled',
	'error',
	'onclick'
]);

var root = $.from_html(`<button><!></button>`);

export default function IconButton($$anchor, $$props) {
	let activityColor = $.prop($$props, 'activityColor', 3, 'transparent'),
		active = $.prop($$props, 'active', 3, false),
		warn = $.prop($$props, 'warn', 3, false),
		success = $.prop($$props, 'success', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		rest = $.rest_props($$props, rest_excludes);

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

	let state = $.derived(() => error()
		? 'error'
		: warn()
			? 'warn'
			: success() ? 'success' : active() ? 'active' : 'default');

	let colors = $.derived(() => ({
		activityColor: activityColors[activityColor()],
		backgroundColor: backgroundColors[$.get(state)],
		backgroundColorHover: backgroundColorsHover[$.get(state)],
		backgroundColorFocus: backgroundColorsFocus[$.get(state)],
		backgroundColorActive: backgroundColorsActive[$.get(state)],
		textColor: textColor[$.get(state)]
	}));

	var button = root();

	$.attribute_effect(
		button,
		() => ({
			'aria-label': $$props.label,
			onclick: $$props.onclick,
			style: `--activityColor: ${$.get(colors).activityColor ?? ''}; --background-color: ${$.get(colors).backgroundColor ?? ''}; --background-color-hover: ${$.get(colors).backgroundColorHover ?? ''}; --background-color-focus: ${$.get(colors).backgroundColorFocus ?? ''}; --background-color-active: ${$.get(colors).backgroundColorActive ?? ''}; --text-color: ${$.get(colors).textColor ?? ''};`,
			disabled: disabled(),
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-19pn2e'
	);

	var node = $.child(button);

	Icon(node, {
		size: '15',
		get name() {
			return $$props.icon;
		}
	});

	$.reset(button);
	$.append($$anchor, button);
}