import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPreviewLevel, useSearchContext } from '../contexts.js';
import { getContext, setContext } from 'svelte';
import { useOptions } from '../options.svelte.js';
import { InspectError } from '../types.js';
import { getType, stringifyPath } from '../util.js';
import Default from './Default.svelte';
import HtmlView from './HTMLView.svelte';
import { getComponent, getDefaultComponent } from './index.js';
import InspectErrorView from './InspectErrorView.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'keyDelim',
	'path',
	'usedefaults',
	'forceView'
]);

export default function Node($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable @typescript-eslint/no-explicit-any
	let value = $.prop($$props, 'value', 3, undefined),
		keyDelim = $.prop($$props, 'keyDelim', 3, ':'),
		prevPath = $.prop($$props, 'path', 19, () => []),
		usedefaults = $.prop($$props, 'usedefaults', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();
	const previewLevel = getPreviewLevel();

	let type = $.derived(() => $$props.forceView
		? $$props.forceView
		: getType(value(), options.value.stores));

	// FIXME: this is so messy
	function getTypeComponent(value, type, useDefaults, options

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) {
		let entry = getComponent(type, useDefaults ? {} : options.customComponents);

		if (entry) {
			let [component, propfn, predicate] = entry;
			let props = propfn ? propfn({ value }) : {};

			if (predicate) {
				const use = predicate({ value, key: $$props.key, type, ...rest });

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

	let $$d = $.derived(() => getTypeComponent(value(), $.get(type), usedefaults(), options.value)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		TypeComponent = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	let path = $.derived(() => $$props.key != null && prevPath() ? [...prevPath(), $$props.key] : ['root']);
	let stringifiedPath = $.derived(() => stringifyPath($.get(path)));
	const searchResult = useSearchContext();

	const $$d_1 = $.derived(searchResult),
		matchingPaths = $.derived(() => $.get($$d_1).matchingPaths);

	let match = $.derived(() => {
		if ($.get(matchingPaths) && $.get(matchingPaths).length) {
			return $.get(matchingPaths).findIndex((p) => p === $.get(stringifiedPath)) > -1;
		}

		return false;
	});

	const _parentIsExact = getContext(Symbol.for('siv.exact'));

	setContext(Symbol.for('siv.exact'), () => $.get(match));

	let visible = $.derived(() => {
		if (previewLevel > 0) return true;
		if ($.get(matchingPaths).length === 0) return true;

		if ($.get(matchingPaths).length > 0) {
			const searchMode = options.value.search;

			if (!searchMode) {
				return true;
			}

			if (searchMode === true || searchMode === 'filter') {
				return _parentIsExact || $.get(match);
			}

			if (searchMode === 'filter-strict') {
				return $.get(match);
			}
		}

		return true;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				const failed = ($$anchor, error = $.noop, reset = $.noop) => {
					const inspectError = $.derived(() => new InspectError(`Component for value of type ${$.get(type)} failed`, value(), { cause: error() }));

					InspectErrorView($$anchor, {
						get value() {
							return $.get(inspectError);
						},

						get key() {
							return $$props.key;
						},

						get path() {
							return $.get(path);
						},

						get reset() {
							return reset();
						}
					});
				};

				$.boundary(
					node_1,
					{
						onerror: (e) => console.error(new Error(`Caught in Node.svelte. Key: ${String($$props.key)}`, { cause: e })),
						failed
					},
					($$anchor) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => $.get(TypeComponent), ($$anchor, TypeComponent_1) => {
							TypeComponent_1($$anchor, $.spread_props(
								{
									get value() {
										return value();
									},

									get key() {
										return $$props.key;
									},

									get keyDelim() {
										return keyDelim();
									},

									get type() {
										return $.get(type);
									},

									get path() {
										return $.get(path);
									},

									get match() {
										return $.get(match);
									}
								},
								() => rest,
								() => $.get(componentProps)
							));
						});

						$.append($$anchor, fragment_3);
					}
				);
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}