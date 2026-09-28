import * as $ from 'svelte/internal/server';
import { getIsKey, getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import Bullet from './Bullet.svelte';
import Count from './Count.svelte';
import Highlight from './Highlight.svelte';
import Key from './Key.svelte';
import NodeNote from './NodeNote.svelte';
import Row from './Row.svelte';
import Tools from './Tools.svelte';
import Type from './Type.svelte';

export default function OneLineView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			display,
			key,
			showKey = true,
			keyDelim = ':',
			keyPrefix,
			keyStyle,
			type,
			forceType,
			path,
			length,
			showLength = true,
			note,
			match,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();

		const $$d = $.derived(() => options.value),
			borderless = $.derived(() => $$d().borderless),
			optsShowLength = $.derived(() => $$d().showLength);

		let previewLevel = getPreviewLevel();
		let isKey = getIsKey();
		let displayOrValue = $.derived(() => display != null ? display : value?.toString?.() ?? '');
		let title = $.derived(() => typeof value === 'string' ? value : display != null ? display : value?.toString());

		$$renderer.push(`<div${$.attributes({
			'data-testid': 'line',
			class: $.clsx([
				'line',
				match && 'match',
				(previewLevel || isKey) && 'preview',
				!showKey && 'nokey'
			]),
			...rest
		})}>`);

		Row($$renderer, {
			collapsed: true,
			disabled: true,
			isFocusTarget: previewLevel === 0,
			previewLevel,
			borderless: borderless(),
			children: ($$renderer) => {
				if (!previewLevel && !isKey) {
					$$renderer.push('<!--[0-->');
					Bullet($$renderer, { value });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (showKey) {
					$$renderer.push('<!--[0-->');

					Key($$renderer, {
						disabled: true,
						prefix: keyPrefix,
						delim: keyDelim,
						style: keyStyle,
						key,
						path
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!isKey) {
					$$renderer.push('<!--[0-->');
					Type($$renderer, { type, force: forceType });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else if (displayOrValue()) {
					$$renderer.push('<!--[1-->');

					Highlight($$renderer, {
						'data-testid': 'value',
						title: title(),
						class: ['value', type],
						value: displayOrValue(),
						fields: ['value']
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (note && !previewLevel) {
					$$renderer.push('<!--[0-->');

					NodeNote($$renderer, {
						title: note.description,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(note.title)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (typeof length === 'number' && showLength && optsShowLength() && !previewLevel) {
					$$renderer.push('<!--[0-->');
					Count($$renderer, { length, type });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (!isKey && !previewLevel) {
			$$renderer.push('<!--[0-->');
			Tools($$renderer, { value, path, type });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}