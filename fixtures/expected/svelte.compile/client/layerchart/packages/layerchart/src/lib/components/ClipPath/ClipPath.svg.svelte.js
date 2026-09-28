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
	'children',
	'clip'
]);

var root = $.from_svg(`<path></path>`);
var root_1 = $.from_svg(`<use></use>`);
var root_2 = $.from_svg(`<g class="lc-clip-path-g"><!></g>`);
var root_3 = $.from_svg(`<defs><clipPath><!><!></clipPath></defs><!>`, 1);

export default function ClipPath_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('clipPath-', uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const c = new ClipPathState(() => ({
		id: id(),
		useId: $$props.useId,
		disabled: disabled(),
		children: $$props.children,
		clip: $$props.clip,
		...rest
	}));

	const url = $.derived(() => `url(#${id()})`);
	var fragment = root_3();
	var defs = $.first_child(fragment);
	var clipPath = $.child(defs);

	$.attribute_effect(clipPath, () => ({ id: id(), ...rest }));

	var node = $.child(clipPath);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.clip, () => ({ id: id() }));
			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			var path = root();

			$.template_effect(() => {
				$.set_attribute(path, 'd', c.effectivePath);
				$.set_attribute(path, 'clip-rule', $$props.invert ? 'evenodd' : undefined);
			});

			$.append($$anchor, path);
		};

		$.if(node, ($$render) => {
			if ($$props.clip) $$render(consequent); else if (c.effectivePath) $$render(consequent_1, 1);
		});
	}

	var node_2 = $.sibling(node);

	{
		var consequent_2 = ($$anchor) => {
			var use = root_1();

			$.template_effect(() => $.set_attribute(use, 'href', `#${$$props.useId ?? ''}`));
			$.append($$anchor, use);
		};

		$.if(node_2, ($$render) => {
			if ($$props.useId) $$render(consequent_2);
		});
	}

	$.reset(clipPath);
	$.reset(defs);

	var node_3 = $.sibling(defs);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.snippet(node_5, () => $$props.children, () => ({ id: id(), url: $.get(url), useId: $$props.useId }));
					$.append($$anchor, fragment_3);
				};

				var alternate = ($$anchor) => {
					var g = root_2();
					let styles;
					var node_6 = $.child(g);

					$.snippet(node_6, () => $$props.children, () => ({ id: id(), url: $.get(url), useId: $$props.useId }));
					$.reset(g);
					$.template_effect(() => styles = $.set_style(g, '', styles, { 'clip-path': $.get(url) }));
					$.append($$anchor, g);
				};

				$.if(node_4, ($$render) => {
					if (disabled()) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.children) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}