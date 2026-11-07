import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import CollapseStateProvider from './CollapseStateProvider.svelte';
import Wrapper from './Wrapper.svelte';
import PropertyList from './components/PropertyList.svelte';
import { logToConsole } from './hello.svelte.js';
import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js';
import { initialize } from './util.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div style="color: var(--_comment-color); text-align: center">no value</div>`);

export default function InspectValues($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	let valueKeys = $.derived(() => {
		const allKeys = Object.keys(props);
		const symbolKeys = Object.getOwnPropertySymbols(props).filter((s) => s.description !== '@attach');

		return [...allKeys, ...symbolKeys];
	});

	let attachments = $.derived(() => {
		const out = {};
		const attachmentSymbols = Object.getOwnPropertySymbols(props);

		attachmentSymbols.forEach((s) => {
			if (s.description === '@attach') out[s] = props[s];
		});

		return out;
	});

	let withOptionsContext = getContext(Symbol.for('siv.with-options'));

	let withOptions = $.derived(() => {
		if (typeof withOptionsContext === 'function') {
			return withOptionsContext();
		}

		return {};
	});

	let globalOptions = getGlobalInspectOptions();
	let mergedOptions = $.derived(() => mergeOptions($.get(withOptions), typeof globalOptions === 'function' ? globalOptions() : globalOptions));
	const options = createOptions(() => $.get(mergedOptions));

	let $$d = $.derived(() => options.value),
		theme = $.derived(() => $.get($$d).theme),
		noanimate = $.derived(() => $.get($$d).noanimate),
		borderless = $.derived(() => $.get($$d).borderless),
		onCollapseChange = $.derived(() => $.get($$d).onCollapseChange),
		onLog = $.derived(() => $.get($$d).onLog),
		heading = $.derived(() => $.get($$d).heading);

	let elementAttributes = $.derived(() => $.fallback($.get(withOptions).elementAttributes, () => ({}), true));

	let classValue = $.derived(() => $.get(elementAttributes).class),
		attrs = $.derived(() => $.exclude_from_object($.get(elementAttributes), ['class']));

	let shouldRender = $.derived(() => typeof options.value.renderIf === 'function'
		? Boolean(options.value.renderIf())
		: Boolean(options.value.renderIf));

	function log() {
		if ($.get(onLog)) {
			$.get(onLog)(props, 'props', ['Inspect.Values#props']);
		} else {
			logToConsole(['Inspect.Values#props'], props, 'props');
		}
	}

	initialize(options);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			CollapseStateProvider($$anchor, {
				get onCollapseChange() {
					return $.get(onCollapseChange);
				},

				get values() {
					return props;
				},

				get keys() {
					return $.get(valueKeys);
				},
				name: '',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [
							$.get(theme),
							$.get(noanimate) && 'noanimate',
							$.get(borderless) && 'borderless',
							$.get(classValue)
						]);

						Wrapper($$anchor, $.spread_props(
							{
								'data-testid': 'inspect',
								get class() {
									return $.get($0);
								},
								showExpandCollapse: true,
								onlog: log,
								get heading() {
									return $.get(heading);
								}
							},
							() => $.get(attrs),
							() => $.get(attachments),
							{
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_1 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											PropertyList($$anchor, {
												get value() {
													return props;
												},

												get keys() {
													return $.get(valueKeys);
												}
											});
										};

										var alternate = ($$anchor) => {
											var div = root();

											$.append($$anchor, div);
										};

										$.if(node_1, ($$render) => {
											if ($.get(valueKeys).length) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}
						));
					}
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(shouldRender)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}