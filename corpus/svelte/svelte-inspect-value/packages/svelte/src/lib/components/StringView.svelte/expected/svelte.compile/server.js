import * as $ from 'svelte/internal/server';
import { getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { stringify } from '../util.js';
import Expandable from './Expandable.svelte';
import Highlight from './Highlight.svelte';
import Node from './Node.svelte';
import OneLineView from './OneLineView.svelte';
import StringValue from './StringValue.svelte';

export default function StringView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = '',
			key,
			type,
			path,
			showKey,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const previewLevel = getPreviewLevel();
		const options = useOptions();
		let isMultiLine = $.derived(() => value.includes('\n'));

		let parsedValue = $.derived(() => {
			const canBeValidJSON = value.startsWith('{') || value.startsWith('[');

			if (options.value.parseJson && canBeValidJSON) {
				try {
					const p = JSON.parse(value);

					return p;
				} catch {
					return;
				}
			}

			return;
		});

		const IMAGE_EXTENSIONS = ['.gif', '.png', '.svg', '.jpg', '.jpeg', '.webp'];
		const AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav'];
		let isUrl = $.derived(() => URL.canParse(value) || value.startsWith('/'));
		let isImageUrl = $.derived(() => IMAGE_EXTENSIONS.some((extension) => value.endsWith(extension)) && isUrl() || value.startsWith('data:image'));
		let isAudioUrl = $.derived(() => AUDIO_EXTENSIONS.some((extension) => value.endsWith(extension)) && isUrl());

		if (parsedValue()) {
			$$renderer.push('<!--[0-->');

			Node($$renderer, $.spread_props([
				{
					value: parsedValue(),
					path: path?.toSpliced(path.length - 1),
					key
				},
				rest,
				{
					note: {
						title: 'json',
						description: 'This value was parsed from a JSON string'
					}
				}
			]));
		} else if ((isMultiLine() || (isImageUrl() || isAudioUrl()) && options.value.embedMedia) && !previewLevel) {
			$$renderer.push('<!--[1-->');

			{
				function valuePreview($$renderer, { showPreview }) {
					if (showPreview) {
						$$renderer.push('<!--[0-->');
						StringValue($$renderer, { value });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				Expandable($$renderer, $.spread_props([
					{ value, key, type, path, showKey },
					{ length: value.length, keepPreviewOnExpand: true },
					rest,
					{
						valuePreview,
						children: ($$renderer) => {
							if (isImageUrl() && options.value.embedMedia) {
								$$renderer.push(`<!--[0--><div class="embed svelte-181toye"><div class="image svelte-181toye"><img${$.attr('alt', key.toString())}${$.attr('src', value)} style="height: 100%" class="svelte-181toye"/></div></div>`);
							} else if (isAudioUrl() && options.value.embedMedia) {
								$$renderer.push(`<!--[1--><div class="embed svelte-181toye"><audio controls=""${$.attr('src', value)}></audio></div>`);
							} else if (isMultiLine()) {
								$$renderer.push(`<!--[2--><pre class="value string multi"${$.attr('title', value)}>`);
								Highlight($$renderer, { value, fields: ['value'] });
								$$renderer.push(`<!----></pre>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { valuePreview: true, default: true }
					}
				]));
			}
		} else {
			$$renderer.push('<!--[-1-->');

			OneLineView($$renderer, $.spread_props([
				{
					showKey,
					key,
					type,
					path,
					value,
					length: value.length,
					title: stringify(value)
				},
				rest,
				{
					children: ($$renderer) => {
						StringValue($$renderer, { value });
					},
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!--]-->`);
	});
}