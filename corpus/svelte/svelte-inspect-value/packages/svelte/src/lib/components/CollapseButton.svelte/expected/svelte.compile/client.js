import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scale } from 'svelte/transition';
import { flash as flashOnUpdate } from '../attachments/update-flash.svelte.js';
import { useOptions } from '../options.svelte.js';
import Bullet from './Bullet.svelte';
import Caret from './icons/Caret.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'collapsed',
	'onchange',
	'disabled',
	'value',
	'key',
	'type'
]);

var root = $.from_html(`<div class="caret-transition svelte-upkuqn"><!></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function CollapseButton($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let flashing = $.state(false);
	let childflash = $.state(false);
	let options = useOptions();

	let rotation = $.derived(() => {
		if ($$props.collapsed) return 0;

		return 90;
	});

	function flash() {
		if ($.get(childflash)) return;

		$.set(childflash, true);

		window.setTimeout(
			() => {
				$.set(childflash, false);
			},
			options.flashDuration
		);
	}

	function flashButton() {
		if ($.get(flashing)) return;

		$.set(flashing, true);

		window.setTimeout(
			() => {
				$.set(flashing, false);
			},
			options.flashDuration
		);
	}

	let keyOrType = $.derived(() => ($$props.key ?? $$props.type)?.toString());
	var $$exports = { flash, flashButton };
	var div = root_1();

	$.attribute_effect(
		div,
		() => ({
			'data-testid': 'collapse-button',
			class: [
				'collapse',
				$.get(flashing) && 'flashing',
				$.get(childflash) && 'child-flash'
			],
			'aria-label': `${$$props.collapsed ? 'expand' : 'collapse'} ${$.get(keyOrType)}`,
			...rest,
			[$.STYLE]: { '--flash-duration': options.flashDuration }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-upkuqn'
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Bullet($$anchor, {});
		};

		var alternate = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Caret(node_1, {
				get style() {
					return `rotate:${$.get(rotation) ?? ''}deg;
        transition: rotate var(--__transition-duration) var(--_back-out);
        width: 100%; height: 100%;`;
				},
				[$.attachment()]: ($$node) => (flashOnUpdate(() => $$props.value, flashButton, options.value.flashOnUpdate) || $.noop)($$node)
			});

			$.reset(div_1);
			$.transition(1, div_1, () => scale, () => ({ duration: options.transitionDuration }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.disabled) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}