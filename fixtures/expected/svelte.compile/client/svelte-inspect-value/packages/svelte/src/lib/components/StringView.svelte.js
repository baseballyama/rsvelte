import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { stringify } from '../util.js';
import Expandable from './Expandable.svelte';
import Highlight from './Highlight.svelte';
import Node from './Node.svelte';
import OneLineView from './OneLineView.svelte';
import StringValue from './StringValue.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path',
	'showKey'
]);

var root = $.from_html(`<div class="embed svelte-181toye"><div class="image svelte-181toye"><img style="height: 100%" class="svelte-181toye"/></div></div>`);
var root_1 = $.from_html(`<div class="embed svelte-181toye"><audio controls=""></audio></div>`);
var root_2 = $.from_html(`<pre class="value string multi"><!></pre>`);

export default function StringView($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	const previewLevel = getPreviewLevel();
	const options = useOptions();
	let isMultiLine = $.derived(() => value().includes('\n'));

	let parsedValue = $.derived(() => {
		const canBeValidJSON = value().startsWith('{') || value().startsWith('[');

		if (options.value.parseJson && canBeValidJSON) {
			try {
				const p = JSON.parse(value());

				return p;
			} catch {
				return;
			}
		}

		return;
	});

	const IMAGE_EXTENSIONS = ['.gif', '.png', '.svg', '.jpg', '.jpeg', '.webp'];
	const AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav'];
	let isUrl = $.derived(() => URL.canParse(value()) || value().startsWith('/'));
	let isImageUrl = $.derived(() => IMAGE_EXTENSIONS.some((extension) => value().endsWith(extension)) && $.get(isUrl) || value().startsWith('data:image'));
	let isAudioUrl = $.derived(() => AUDIO_EXTENSIONS.some((extension) => value().endsWith(extension)) && $.get(isUrl));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.path?.toSpliced($$props.path.length - 1));

				Node($$anchor, $.spread_props(
					{
						get value() {
							return $.get(parsedValue);
						},

						get path() {
							return $.get($0);
						},

						get key() {
							return $$props.key;
						}
					},
					() => rest,
					{
						note: {
							title: 'json',
							description: 'This value was parsed from a JSON string'
						}
					}
				));
			}
		};

		var consequent_5 = ($$anchor) => {
			{
				const valuePreview = ($$anchor, $$arg0) => {
					let showPreview = () => ($$arg0?.()).showPreview;
					var fragment_3 = $.comment();
					var node_1 = $.first_child(fragment_3);

					{
						var consequent_1 = ($$anchor) => {
							StringValue($$anchor, {
								get value() {
									return value();
								}
							});
						};

						$.if(node_1, ($$render) => {
							if (showPreview()) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_3);
				};

				Expandable($$anchor, $.spread_props(
					() => ({
						value: value(),
						key: $$props.key,
						type: $$props.type,
						path: $$props.path,
						showKey: $$props.showKey
					}),
					{
						get length() {
							return value().length;
						},
						keepPreviewOnExpand: true
					},
					() => rest,
					{
						valuePreview,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_2 = $.first_child(fragment_5);

							{
								var consequent_2 = ($$anchor) => {
									var div = root();
									var div_1 = $.child(div);
									var img = $.only_child(div_1);

									$.reset(div);

									$.template_effect(
										($0) => {
											$.set_attribute(img, 'alt', $0);
											$.set_attribute(img, 'src', value());
										},
										[() => $$props.key.toString()]
									);

									$.append($$anchor, div);
								};

								var consequent_3 = ($$anchor) => {
									var div_2 = root_1();
									var audio = $.only_child(div_2);

									$.template_effect(() => $.set_attribute(audio, 'src', value()));
									$.append($$anchor, div_2);
								};

								var consequent_4 = ($$anchor) => {
									var pre = root_2();
									var node_3 = $.child(pre);

									Highlight(node_3, {
										get value() {
											return value();
										},
										fields: ['value']
									});

									$.reset(pre);
									$.template_effect(() => $.set_attribute(pre, 'title', value()));
									$.append($$anchor, pre);
								};

								$.if(node_2, ($$render) => {
									if ($.get(isImageUrl) && options.value.embedMedia) $$render(consequent_2); else if ($.get(isAudioUrl) && options.value.embedMedia) $$render(consequent_3, 1); else if ($.get(isMultiLine)) $$render(consequent_4, 2);
								});
							}

							$.append($$anchor, fragment_5);
						},
						$$slots: { valuePreview: true, default: true }
					}
				));
			}
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => stringify(value()));

				OneLineView($$anchor, $.spread_props(
					{
						get showKey() {
							return $$props.showKey;
						},

						get key() {
							return $$props.key;
						},

						get type() {
							return $$props.type;
						},

						get path() {
							return $$props.path;
						},

						get value() {
							return value();
						},

						get length() {
							return value().length;
						},

						get title() {
							return $.get($0);
						}
					},
					() => rest,
					{
						children: ($$anchor, $$slotProps) => {
							StringValue($$anchor, {
								get value() {
									return value();
								}
							});
						},
						$$slots: { default: true }
					}
				));
			}
		};

		$.if(node, ($$render) => {
			if ($.get(parsedValue)) $$render(consequent); else if (($.get(isMultiLine) || ($.get(isImageUrl) || $.get(isAudioUrl)) && options.value.embedMedia) && !previewLevel) $$render(consequent_5, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}