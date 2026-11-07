import * as $ from 'svelte/internal/server';
import { getPreviewLevel, useSearchContext } from '../contexts.js';
import { getContext, setContext } from 'svelte';
import { useOptions } from '../options.svelte.js';
import { InspectError } from '../types.js';
import { getType, stringifyPath } from '../util.js';
import Default from './Default.svelte';
import HtmlView from './HTMLView.svelte';
import { getComponent, getDefaultComponent } from './index.js';
import InspectErrorView from './InspectErrorView.svelte';

export default function Node($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable @typescript-eslint/no-explicit-any
		let {
			value = undefined,
			key,
			keyDelim = ':',
			path: prevPath = [],
			usedefaults = false,
			forceView,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();
		const previewLevel = getPreviewLevel();
		let type = $.derived(() => forceView ? forceView : getType(value, options.value.stores));

		// FIXME: this is so messy
		function getTypeComponent(value, type, useDefaults, options

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		) {
			let entry = getComponent(type, useDefaults ? {} : options.customComponents);

			if (entry) {
				let [component, propfn, predicate] = entry;
				let props = propfn ? propfn({ value }) : {};

				if (predicate) {
					const use = predicate({ value, key, type, ...rest });

					if (!use) {
						const [component, propfn] = getDefaultComponent(type);
						const props = propfn ? propfn({ value }) : {};

						return [component, props];
					}
				}

				return [component, props];
			}

			try {
				if (value instanceof HTMLElement) {
					return [HtmlView, {}];
				}
			} catch {
				return [Default, {}];
			}

			return [Default, {}];
		}

		let $$d = $.derived(() => getTypeComponent(value, type(), usedefaults, options.value)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			TypeComponent = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		let path = $.derived(() => key != null && prevPath ? [...prevPath, key] : ['root']);
		let stringifiedPath = $.derived(() => stringifyPath(path()));
		const searchResult = useSearchContext();

		const $$d_1 = $.derived(searchResult),
			matchingPaths = $.derived(() => $$d_1().matchingPaths);

		let match = $.derived(() => {
			if (matchingPaths() && matchingPaths().length) {
				return matchingPaths().findIndex((p) => p === stringifiedPath()) > -1;
			}

			return false;
		});

		const _parentIsExact = getContext(Symbol.for('siv.exact'));

		setContext(Symbol.for('siv.exact'), () => match());

		let visible = $.derived(() => {
			if (previewLevel > 0) return true;
			if (matchingPaths().length === 0) return true;

			if (matchingPaths().length > 0) {
				const searchMode = options.value.search;

				if (!searchMode) {
					return true;
				}

				if (searchMode === true || searchMode === 'filter') {
					return _parentIsExact || match();
				}

				if (searchMode === 'filter-strict') {
					return match();
				}
			}

			return true;
		});

		if (visible()) {
			$$renderer.push('<!--[0-->');

			{
				function failed($$renderer, error, reset) {
					const inspectError = new InspectError(`Component for value of type ${type()} failed`, value, { cause: error });

					InspectErrorView($$renderer, { value: inspectError, key, path: path(), reset });
				}

				$$renderer.boundary({ failed }, ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					{
						if (TypeComponent()) {
							$$renderer.push('<!--[-->');

							TypeComponent()($$renderer, $.spread_props([
								{
									value,
									key,
									keyDelim,
									type: type(),
									path: path(),
									match: match()
								},
								rest,
								componentProps()
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				});
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}