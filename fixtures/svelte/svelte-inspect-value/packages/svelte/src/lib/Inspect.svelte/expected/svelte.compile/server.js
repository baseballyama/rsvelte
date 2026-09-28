import * as $ from 'svelte/internal/server';
import CollapseStateProvider from './CollapseStateProvider.svelte';
import Node from './components/Node.svelte';
import PropertyList from './components/PropertyList.svelte';
import { logToConsole } from './hello.svelte.js';
import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js';
import { getAllProperties, getType, initialize, sortProps } from './util.js';
import Wrapper from './Wrapper.svelte';

export default function Inspect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			values,
			name,
			class: classValue,
			$$slots,
			$$events,
			...props
		} = $$props;

		let $$d = $.derived(() => sortProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			optionsProps = $.derived(() => $$derived_array()[0]),
			restProps = $.derived(() => $$derived_array()[1]);

		let wrapper = void 0;
		const globalOptions = getGlobalInspectOptions();
		let mergedOptions = $.derived(() => mergeOptions(optionsProps(), typeof globalOptions === 'function' ? globalOptions() : globalOptions));
		let options = createOptions(() => mergedOptions());

		let $$d_1 = $.derived(() => options.value),
			theme = $.derived(() => $$d_1().theme),
			noanimate = $.derived(() => $$d_1().noanimate),
			borderless = $.derived(() => $$d_1().borderless),
			onCollapseChange = $.derived(() => $$d_1().onCollapseChange),
			onLog = $.derived(() => $$d_1().onLog),
			heading = $.derived(() => $$d_1().heading);

		let shouldRender = $.derived(() => typeof options.value.renderIf === 'function'
			? Boolean(options.value.renderIf())
			: Boolean(options.value.renderIf));

		function search(query) {
			wrapper?.searchWithQuery(query);
		}

		let keys = $.derived(() => {
			if (values) {
				if (Array.isArray(values)) {
					return [
						...values.keys(),
						...getAllProperties(values).filter((prop) => {
							if (typeof prop === 'string') {
								return (/\d+/).test(prop) === false && prop !== 'length';
							}

							return true;
						})
					];
				}

				return getAllProperties(values);
			}

			return [];
		});

		function log() {
			if (onLog()) {
				onLog()(values, getType(values), ['Inspect#values']);
			} else {
				logToConsole(['Inspect#values'], values, getType(values));
			}
		}

		initialize(options);

		if (shouldRender()) {
			$$renderer.push('<!--[0-->');

			CollapseStateProvider($$renderer, {
				onCollapseChange: onCollapseChange(),
				value,
				values,
				name,
				keys: keys(),
				children: ($$renderer) => {
					Wrapper($$renderer, $.spread_props([
						{
							'data-testid': 'inspect',
							class: [
								classValue,
								theme(),
								noanimate() && 'noanimate',
								borderless() && 'borderless'
							],
							showExpandCollapse: values != null,
							onlog: log,
							heading: heading()
						},
						restProps(),
						{
							children: ($$renderer) => {
								if (values && keys().length) {
									$$renderer.push('<!--[0-->');
									PropertyList($$renderer, { value: values, keys: keys() });
								} else if (name || value) {
									$$renderer.push('<!--[1-->');
									Node($$renderer, { value, key: name });
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
		$.bind_props($$props, { search });
	});
}