import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPreviewLevel, setIsKey } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { getType, stringify, stringifyPath } from '../util.js';
import Node from './Node.svelte';
import Type from './Type.svelte';
import Highlight from './Highlight.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'key',
	'path',
	'delim',
	'prefix',
	'disabled',
	'onclick'
]);

var root = $.from_html(`<span class="prefix svelte-1dp9xwx"> </span>`);
var root_1 = $.from_html(`<span class="whitespace svelte-1dp9xwx">&sdot;</span>`);
var root_2 = $.from_html(`<span><!></span>`);
var root_3 = $.from_html(`<span class="delim svelte-1dp9xwx"> </span>`);
var root_4 = $.from_html(`<div class="key-and-delimiter svelte-1dp9xwx"><div><!> <!></div> <!></div>`);

export default function Key($$anchor, $$props) {
	$.push($$props, true);

	let path = $.prop($$props, 'path', 19, () => []),
		delim = $.prop($$props, 'delim', 3, ':'),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();
	const keyTypes = ['string', 'number', 'symbol', 'quotedstring'];
	const simpleKeys = ['bigint', 'regexp'];
	const shouldBeQuoted = /[^A-zÀ-ú0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F_$]|[\\[\]`]/;
	const previewLevel = getPreviewLevel();

	let keyType = $.derived(() => {
		const t = getType($$props.key);

		if (t === 'string') {
			if ($$props.key.match(shouldBeQuoted) || $$props.key === '') {
				return 'quotedstring';
			}

			return t;
		}

		return t;
	});

	let display = $.derived(() => {
		if ($$props.key != null) {
			if ($.get(keyType) === 'quotedstring') {
				return stringify($$props.key, undefined, options.value.quotes);
			}

			return $$props.key.toString();
		}

		return $$props.key;
	});

	let shouldShow = $.derived(() => $$props.key === undefined ? previewLevel > 0 : true);

	function onerror(error) {
		throw new Error('Error in Key.svelte', { cause: error });
	}

	setIsKey();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.boundary(node_1, { onerror }, ($$anchor) => {
				var div = root_4();
				var div_1 = $.child(div);

				$.attribute_effect(
					div_1,
					($0, $1) => ({
						'data-testid': 'key',
						class: ['key-outer', $$props.disabled && 'disabled'],
						'aria-label': $0,
						title: $1,
						'data-search-ignore': previewLevel > 0 ? '' : undefined,
						...rest
					}),
					[() => $$props.key?.toString(), () => stringifyPath(path())],
					void 0,
					void 0,
					'svelte-1dp9xwx'
				);

				var node_2 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $$props.prefix));
						$.append($$anchor, span);
					};

					$.if(node_2, ($$render) => {
						if ($$props.prefix) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_3 = ($$anchor) => {
						var span_1 = root_2();
						var node_4 = $.child(span_1);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_5 = $.first_child(fragment_2);

								$.each(node_5, 17, () => $.get(display), $.index, ($$anchor, char) => {
									var fragment_3 = $.comment();
									var node_6 = $.first_child(fragment_3);

									{
										var consequent_1 = ($$anchor) => {
											var span_2 = root_1();

											$.append($$anchor, span_2);
										};

										var alternate = ($$anchor) => {
											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(char)));
											$.append($$anchor, text_1);
										};

										$.if(node_6, ($$render) => {
											if ($.get(char) === ' ') $$render(consequent_1); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_3);
								});

								$.append($$anchor, fragment_2);
							};

							var alternate_1 = ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(display)?.toString() ?? '');
									let $1 = $.derived(() => stringifyPath(path()));

									Highlight($$anchor, {
										get value() {
											return $.get($0);
										},
										fields: ['key', 'path'],
										get alsoMatch() {
											return $.get($1);
										}
									});
								}
							};

							$.if(node_4, ($$render) => {
								if ($.get(keyType) === 'quotedstring' && $$props.key !== '') $$render(consequent_2); else $$render(alternate_1, -1);
							});
						}

						$.reset(span_1);
						$.template_effect(() => $.set_class(span_1, 1, $.clsx(['key', $.get(keyType), $$props.disabled && 'disabled']), 'svelte-1dp9xwx'));
						$.append($$anchor, span_1);
					};

					var d = $.derived(() => keyTypes.includes($.get(keyType)));

					var consequent_4 = ($$anchor) => {
						Node($$anchor, {
							get value() {
								return $$props.key;
							}
						});
					};

					var d_1 = $.derived(() => simpleKeys.includes($.get(keyType)));

					var alternate_2 = ($$anchor) => {
						Type($$anchor, {
							get type() {
								return $.get(keyType);
							},
							force: true
						});
					};

					$.if(node_3, ($$render) => {
						if ($.get(d)) $$render(consequent_3); else if ($.get(d_1)) $$render(consequent_4, 1); else $$render(alternate_2, -1);
					});
				}

				$.reset(div_1);

				var node_7 = $.sibling(div_1, 2);

				{
					var consequent_5 = ($$anchor) => {
						var span_3 = root_3();
						var text_2 = $.only_child(span_3, true);

						$.template_effect(() => $.set_text(text_2, delim()));
						$.append($$anchor, span_3);
					};

					$.if(node_7, ($$render) => {
						if (delim()) $$render(consequent_5);
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(shouldShow)) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}