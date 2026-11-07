import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import CollapseStateProvider from './CollapseStateProvider.svelte';
import Wrapper from './Wrapper.svelte';
import PropertyList from './components/PropertyList.svelte';
import { logToConsole } from './hello.svelte.js';
import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js';
import { initialize } from './util.js';

export default function InspectValues($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

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
		let mergedOptions = $.derived(() => mergeOptions(withOptions(), typeof globalOptions === 'function' ? globalOptions() : globalOptions));
		const options = createOptions(() => mergedOptions());

		let $$d = $.derived(() => options.value),
			theme = $.derived(() => $$d().theme),
			noanimate = $.derived(() => $$d().noanimate),
			borderless = $.derived(() => $$d().borderless),
			onCollapseChange = $.derived(() => $$d().onCollapseChange),
			onLog = $.derived(() => $$d().onLog),
			heading = $.derived(() => $$d().heading);

		let elementAttributes = $.derived(() => $.fallback(withOptions().elementAttributes, () => ({}), true));

		let classValue = $.derived(() => elementAttributes().class),
			attrs = $.derived(() => $.exclude_from_object(elementAttributes(), ['class']));

		let shouldRender = $.derived(() => typeof options.value.renderIf === 'function'
			? Boolean(options.value.renderIf())
			: Boolean(options.value.renderIf));

		function log() {
			if (onLog()) {
				onLog()(props, 'props', ['Inspect.Values#props']);
			} else {
				logToConsole(['Inspect.Values#props'], props, 'props');
			}
		}

		initialize(options);

		if (shouldRender()) {
			$$renderer.push('<!--[0-->');

			CollapseStateProvider($$renderer, {
				onCollapseChange: onCollapseChange(),
				values: props,
				keys: valueKeys(),
				name: '',
				children: ($$renderer) => {
					Wrapper($$renderer, $.spread_props([
						{
							'data-testid': 'inspect',
							class: [
								theme(),
								noanimate() && 'noanimate',
								borderless() && 'borderless',
								classValue()
							],
							showExpandCollapse: true,
							onlog: log,
							heading: heading()
						},
						attrs(),
						attachments(),
						{
							children: ($$renderer) => {
								if (valueKeys().length) {
									$$renderer.push('<!--[0-->');
									PropertyList($$renderer, { value: props, keys: valueKeys() });
								} else {
									$$renderer.push(`<!--[-1--><div style="color: var(--_comment-color); text-align: center">no value</div>`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						}
					]));
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}