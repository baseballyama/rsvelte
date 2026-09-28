import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createId } from '$lib/utils/createId.js';
import { ClipPathState } from './ClipPath.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'useId',
	'disabled',
	'invert',
	'children'
]);

var root = $.from_html(`<div class="lc-clip-path-div"><!></div>`);

export default function ClipPath_html($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('clipPath-', uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		invert = $.prop($$props, 'invert', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const c = new ClipPathState(() => ({
		id: id(),
		useId: $$props.useId,
		disabled: disabled(),
		invert: invert(),
		children: $$props.children,
		...rest
	}));

	const url = $.derived(() => `url(#${id()})`);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.snippet(node_2, () => $$props.children, () => ({ id: id(), url: $.get(url), useId: $$props.useId }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div = root();
					let styles;
					var node_3 = $.child(div);

					$.snippet(node_3, () => $$props.children, () => ({ id: id(), url: $.get(url), useId: $$props.useId }));
					$.reset(div);

					$.template_effect(() => styles = $.set_style(div, '', styles, {
						position: 'absolute',
						inset: '0',
						'clip-path': invert()
							? `path(evenodd, "${c.effectivePath}")`
							: `path("${c.effectivePath}")`
					}));

					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (disabled() || !c.effectivePath) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}