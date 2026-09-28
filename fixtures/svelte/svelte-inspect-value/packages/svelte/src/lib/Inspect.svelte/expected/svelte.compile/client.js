import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CollapseStateProvider from './CollapseStateProvider.svelte';
import Node from './components/Node.svelte';
import PropertyList from './components/PropertyList.svelte';
import { logToConsole } from './hello.svelte.js';
import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js';
import { getAllProperties, getType, initialize, sortProps } from './util.js';
import Wrapper from './Wrapper.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'values',
	'name',
	'class'
]);

var root = $.from_html(`<div style="color: var(--_comment-color); text-align: center">no value</div>`);

export default function Inspect($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	let $$d = $.derived(() => sortProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		optionsProps = $.derived(() => $.get($$array)[0]),
		restProps = $.derived(() => $.get($$array)[1]);

	let wrapper = $.state(void 0);
	const globalOptions = getGlobalInspectOptions();
	let mergedOptions = $.derived(() => mergeOptions($.get(optionsProps), typeof globalOptions === 'function' ? globalOptions() : globalOptions));
	let options = createOptions(() => $.get(mergedOptions));

	let $$d_1 = $.derived(() => options.value),
		theme = $.derived(() => $.get($$d_1).theme),
		noanimate = $.derived(() => $.get($$d_1).noanimate),
		borderless = $.derived(() => $.get($$d_1).borderless),
		onCollapseChange = $.derived(() => $.get($$d_1).onCollapseChange),
		onLog = $.derived(() => $.get($$d_1).onLog),
		heading = $.derived(() => $.get($$d_1).heading);

	let shouldRender = $.derived(() => typeof options.value.renderIf === 'function'
		? Boolean(options.value.renderIf())
		: Boolean(options.value.renderIf));

	function search(query) {
		$.get(wrapper)?.searchWithQuery(query);
	}

	let keys = $.derived(() => {
		if ($$props.values) {
			if (Array.isArray($$props.values)) {
				return [
					...$$props.values.keys(),
					...getAllProperties($$props.values).filter((prop) => {
						if (typeof prop === 'string') {
							return (/\d+/).test(prop) === false && prop !== 'length';
						}

						return true;
					})
				];
			}

			return getAllProperties($$props.values);
		}

		return [];
	});

	function log() {
		if ($.get(onLog)) {
			$.get(onLog)($$props.values, getType($$props.values), ['Inspect#values']);
		} else {
			logToConsole(['Inspect#values'], $$props.values, getType($$props.values));
		}
	}

	initialize(options);

	var $$exports = { search };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			CollapseStateProvider($$anchor, {
				get onCollapseChange() {
					return $.get(onCollapseChange);
				},

				get value() {
					return $$props.value;
				},

				get values() {
					return $$props.values;
				},

				get name() {
					return $$props.name;
				},

				get keys() {
					return $.get(keys);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [
							$$props.class,
							$.get(theme),
							$.get(noanimate) && 'noanimate',
							$.get(borderless) && 'borderless'
						]);

						let $1 = $.derived(() => $$props.values != null);

						$.bind_this(
							Wrapper($$anchor, $.spread_props(
								{
									'data-testid': 'inspect',
									get class() {
										return $.get($0);
									},

									get showExpandCollapse() {
										return $.get($1);
									},
									onlog: log,
									get heading() {
										return $.get(heading);
									}
								},
								() => $.get(restProps),
								{
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_1 = $.first_child(fragment_3);

										{
											var consequent = ($$anchor) => {
												PropertyList($$anchor, {
													get value() {
														return $$props.values;
													},

													get keys() {
														return $.get(keys);
													}
												});
											};

											var consequent_1 = ($$anchor) => {
												Node($$anchor, {
													get value() {
														return $$props.value;
													},

													get key() {
														return $$props.name;
													}
												});
											};

											var alternate = ($$anchor) => {
												var div = root();

												$.append($$anchor, div);
											};

											$.if(node_1, ($$render) => {
												if ($$props.values && $.get(keys).length) $$render(consequent); else if ($$props.name || $$props.value) $$render(consequent_1, 1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}
							)),
							($$value) => $.set(wrapper, $$value, true),
							() => $.get(wrapper)
						);
					}
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(shouldRender)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}