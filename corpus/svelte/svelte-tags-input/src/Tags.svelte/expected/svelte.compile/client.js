import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span role="button" tabindex="-1" class="svelte-tags-input-tag-remove svelte-1m7ml2m">&#215;</span>`);
var root_1 = $.from_html(`<button type="button" class="svelte-tags-input-tag svelte-1m7ml2m"><!> <!></button>`);
var root_2 = $.from_html(`<li tabindex="-1"></li>`);
var root_3 = $.from_html(`<div class="svelte-tags-input-matchs-parent svelte-1m7ml2m"><ul class="svelte-tags-input-matchs svelte-1m7ml2m"></ul></div>`);
var root_4 = $.from_html(`<div><label> </label> <!> <input type="text" class="svelte-tags-input svelte-1m7ml2m" autocomplete="off"/></div> <!>`, 1);

export default function Tags($$anchor, $$props) {
	$.push($$props, true);

	let tags = $.prop($$props, 'tags', 31, () => $.proxy([])),
		addKeys = $.prop($$props, 'addKeys', 19, () => [13]),
		maxTags = $.prop($$props, 'maxTags', 3, false),
		onlyUnique = $.prop($$props, 'onlyUnique', 3, false),
		removeKeys = $.prop($$props, 'removeKeys', 19, () => [8]),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		allowPaste = $.prop($$props, 'allowPaste', 3, false),
		allowDrop = $.prop($$props, 'allowDrop', 3, false),
		splitWith = $.prop($$props, 'splitWith', 3, ','),
		autoComplete = $.prop($$props, 'autoComplete', 3, false),
		autoCompleteFilter = $.prop($$props, 'autoCompleteFilter', 3, true),
		autoCompleteKey = $.prop($$props, 'autoCompleteKey', 3, false),
		autoCompleteMarkupKey = $.prop($$props, 'autoCompleteMarkupKey', 3, false),
		autoCompleteStartFocused = $.prop($$props, 'autoCompleteStartFocused', 3, false),
		name = $.prop($$props, 'name', 3, 'svelte-tags-input'),
		allowBlur = $.prop($$props, 'allowBlur', 3, false),
		disable = $.prop($$props, 'disable', 3, false),
		minChars = $.prop($$props, 'minChars', 3, 1),
		onlyAutocomplete = $.prop($$props, 'onlyAutocomplete', 3, false),
		labelShow = $.prop($$props, 'labelShow', 3, false),
		readonly = $.prop($$props, 'readonly', 3, false),
		onTagClick = $.prop($$props, 'onTagClick', 3, () => {}),
		onTagAdded = $.prop($$props, 'onTagAdded', 3, () => {}),
		onTagRemoved = $.prop($$props, 'onTagRemoved', 3, () => {}),
		cleanOnBlur = $.prop($$props, 'cleanOnBlur', 3, false),
		customValidation = $.prop($$props, 'customValidation', 3, false);

	let tagInput = $.state('');
	let arrelementsmatch = $.state($.proxy([]));
	let layoutElement = $.state(null);
	let generatedId = 'sti_' + Math.random().toString(36).substring(2, 11);
	let id = $.derived(() => $$props.id || generatedId);
	let matchsID = $.derived(() => $.get(id) + '_matchs');
	let autoCompleteIndexStart = $.derived(() => autoCompleteStartFocused() ? 0 : -1);
	let autoCompleteIndex = $.state(-1);
	let displayPlaceholder = $.derived(() => maxTags() && tags().length >= maxTags() ? '' : placeholder());
	let resolvedLabelText = $.derived(() => $$props.labelText ?? name());
	let resolvedAutoCompleteShowKey = $.derived(() => $$props.autoCompleteShowKey ?? autoCompleteKey());

	const keyCodeMap = {
		Enter: 13,
		Backspace: 8,
		Escape: 27,
		ArrowDown: 40,
		ArrowUp: 38
	};

	/**
	 * Escapes regex special chars for safe RegExp use.
	 * @param {string} s - String to escape
	 * @returns {string} Escaped string
	 */
	let regExpEscape = (s) => {
		return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
	};

	/**
	 * Handles keydown: add tag (Enter), remove (Backspace),
	 * autocomplete nav (ArrowUp/Down), close (Escape).
	 * @param {KeyboardEvent} e - Key event
	 * @returns {void}
	 */
	function setTag(e) {
		const matches = document.getElementById($.get(matchsID));
		const focusedElement = matches?.querySelector('li.focus')?.textContent;
		const currentTag = focusedElement ?? e.target.value;
		const keyCode = e.keyCode ?? keyCodeMap[e.key];

		if (addKeys()) {
			addKeys().forEach(function (key) {
				if (key === keyCode) {
					if (currentTag) e.preventDefault();

					if (autoComplete() && onlyAutocomplete() && document.getElementById($.get(matchsID))) {
						addTag($.get(arrelementsmatch)?.[$.get(autoCompleteIndex)]?.label);
					} else {
						addTag(currentTag);
					}
				}
			});
		}

		if (removeKeys()) {
			removeKeys().forEach(function (key) {
				if (key === keyCode && $.get(tagInput) === '' && tags().length > 0) {
					removeTag(tags().length - 1);
				}
			});
		}

		if (keyCode === 40 && autoComplete() && document.getElementById($.get(matchsID))) {
			$.update(autoCompleteIndex);

			if ($.get(autoCompleteIndex) >= $.get(arrelementsmatch).length || $.get(autoCompleteIndex) < 0) {
				$.set(autoCompleteIndex, 0);
			}
		} else if (keyCode === 38) {
			$.update(autoCompleteIndex, -1);

			if ($.get(autoCompleteIndex) < 0 || $.get(autoCompleteIndex) >= $.get(arrelementsmatch).length) {
				$.set(autoCompleteIndex, $.get(arrelementsmatch).length - 1);
			}
		} else if (keyCode === 27) {
			$.set(arrelementsmatch, [], true);
			document.getElementById($.get(id)).focus();
		}
	}

	/**
	 * Adds tag if valid: checks empty, maxTags, onlyUnique,
	 * onlyAutocomplete, customValidation. Supports string or object tags.
	 * @param {string | Record<string, unknown>} currentTag - Tag to add
	 * @returns {void}
	 */
	function addTag(currentTag) {
		let currentObjTags = null;

		if (typeof currentTag === 'object' && currentTag !== null) {
			if (!autoCompleteKey()) {
				return console.error("'autoCompleteKey' is necessary if 'autoComplete' result is an array of objects");
			}

			if (onlyUnique()) {
				let found = tags()?.find((elem) => elem[autoCompleteKey()] === currentTag[autoCompleteKey()]);

				if (found) return;
			}

			currentObjTags = currentTag;
			currentTag = currentTag[autoCompleteKey()].trim();
		} else {
			currentTag = (currentTag ?? '').trim();
		}

		if (currentTag == '') return;
		if (maxTags() && tags().length == maxTags()) return;
		if (onlyUnique() && tags().includes(currentTag)) return;
		if (onlyAutocomplete() && $.get(arrelementsmatch).length === 0) return;
		if (customValidation() && !customValidation()(currentTag)) return;

		tags([...tags(), currentObjTags ? currentObjTags : currentTag]);
		$.set(tagInput, '');
		onTagAdded()(currentTag, tags());
		$.set(arrelementsmatch, [], true);
		$.set(autoCompleteIndex, $.get(autoCompleteIndexStart), true);
		document.getElementById($.get(id)).focus();

		if (maxTags() && tags().length == maxTags()) {
			document.getElementById($.get(id)).readOnly = true;
		}
	}

	/**
	 * Removes tag at index, calls onTagRemoved with the removed tag.
	 * @param {number} i - Index of tag to remove
	 * @returns {void}
	 */
	function removeTag(i) {
		const removed = tags()[i];

		tags(tags().filter((_, idx) => idx !== i));
		onTagRemoved()(removed, tags());
		$.set(arrelementsmatch, [], true);
		document.getElementById($.get(id)).readOnly = false;
		document.getElementById($.get(id)).focus();
	}

	/**
	 * Handles paste: splits by splitWith and adds each tag (if allowPaste).
	 * @param {ClipboardEvent} e - Paste event
	 * @returns {void}
	 */
	function onPaste(e) {
		if (!allowPaste()) return;

		e.preventDefault();

		const data = getClipboardData(e);

		splitTags(data).map((t) => addTag(t));
	}

	/**
	 * Handles drop: splits dragged text and adds tags (if allowDrop).
	 * @param {DragEvent} e - Drop event
	 * @returns {void}
	 */
	function onDrop(e) {
		if (!allowDrop()) return;

		e.preventDefault();

		const data = e.dataTransfer.getData('Text');

		splitTags(data).map((t) => addTag(t));
	}

	/**
	 * Adds focus class to layout on input focus.
	 * @returns {void}
	 */
	function onFocus() {
		$.get(layoutElement)?.classList.add('focus');
	}

	/**
	 * Handles blur: optionally adds tag (allowBlur), clears input (cleanOnBlur).
	 * @param {FocusEvent} e - Blur event
	 * @param {string} currentTag - Current input value
	 * @returns {void}
	 */
	function onBlur(e, currentTag) {
		$.get(layoutElement)?.classList.remove('focus');

		if (allowBlur()) {
			if ($.get(arrelementsmatch).length && $.get(autoCompleteIndex) > -1) {
				addTag($.get(arrelementsmatch)?.[$.get(autoCompleteIndex)]?.label);
			} else if (!$.get(arrelementsmatch).length) {
				e.preventDefault();
				addTag(currentTag);
			}
		}

		if (cleanOnBlur()) {
			$.set(tagInput, '');
		}

		$.set(arrelementsmatch, [], true);
		$.set(autoCompleteIndex, $.get(autoCompleteIndexStart), true);
	}

	/**
	 * On input click: shows all autocomplete matches when minChars is 0.
	 * @returns {void}
	 */
	function onClick() {
		if (minChars() == 0) getMatchElements();
	}

	/**
	 * Gets plain text from clipboard (clipboardData or clipboardData API).
	 * @param {ClipboardEvent} e - Clipboard event
	 * @returns {string} Clipboard text or empty string
	 */
	function getClipboardData(e) {
		if (window.clipboardData) {
			return window.clipboardData.getData('Text');
		}

		if (e.clipboardData) {
			return e.clipboardData.getData('text/plain');
		}

		return '';
	}

	/**
	 * Splits string by splitWith and trims each part.
	 * @param {string} data - String to split
	 * @returns {string[]} Array of trimmed tag strings
	 */
	function splitTags(data) {
		return data.split(splitWith()).map((t) => t.trim());
	}

	/**
	 * Escapes HTML entities for safe display.
	 * @param {string} string - Raw string
	 * @returns {string} HTML-escaped string
	 */
	function escapeHTML(string) {
		const htmlEscapes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'/': '&#x2F;'
		};

		return ('' + string).replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
	}

	/**
	 * Wraps matching search substring in <strong> within escaped value.
	 * @param {string} search - Search term (case-insensitive)
	 * @param {string} value - Full string to highlight
	 * @returns {string} HTML with match wrapped in <strong>
	 */
	function buildMatchMarkup(search, value) {
		return escapeHTML(value).replace(RegExp(regExpEscape(search.toLowerCase()), 'i'), '<strong>$&</strong>');
	}

	/**
	 * Fetches autocomplete matches from array or fn, filters, builds match objects.
	 * Updates arrelementsmatch and autoCompleteIndex.
	 * @param {KeyboardEvent} [input] - Keyup event (optional)
	 * @returns {Promise<void>}
	 */
	async function getMatchElements(input) {
		if (!autoComplete()) return;
		if (maxTags() && tags().length >= maxTags()) return;

		let value = input ? input.target.value : '';
		let autoCompleteValues = [];

		if (Array.isArray(autoComplete())) {
			autoCompleteValues = autoComplete();
		}

		if (typeof autoComplete() === 'function') {
			if (autoComplete().constructor.name === 'AsyncFunction') {
				autoCompleteValues = await autoComplete()(value);
			} else {
				autoCompleteValues = autoComplete()(value);
			}
		}

		if (autoCompleteValues.constructor.name === 'Promise') {
			autoCompleteValues = await autoCompleteValues;
		}

		const keyCode = input?.keyCode ?? keyCodeMap[input?.key];

		if (minChars() > 0 && value == '' || input && keyCode === 27 || value.length < minChars()) {
			$.set(arrelementsmatch, [], true);

			return;
		}

		let matchs = autoCompleteValues;

		if (typeof autoCompleteValues[0] === 'object' && autoCompleteValues !== null) {
			if (!autoCompleteKey()) {
				return console.error("'autoCompleteValue' is necessary if 'autoComplete' result is an array of objects");
			}

			if (autoCompleteFilter() !== false) {
				matchs = autoCompleteValues.filter((e) => e[autoCompleteKey()].toLowerCase().includes(value.toLowerCase()));
			}

			matchs = matchs.map((matchTag) => ({
				label: matchTag,
				search: autoCompleteMarkupKey()
					? matchTag[autoCompleteMarkupKey()]
					: buildMatchMarkup(value, matchTag[autoCompleteKey()])
			}));
		} else {
			if (autoCompleteFilter() !== false) {
				matchs = autoCompleteValues.filter((e) => e.toLowerCase().includes(value.toLowerCase()));
			}

			matchs = matchs.map((matchTag) => ({ label: matchTag, search: buildMatchMarkup(value, matchTag) }));
		}

		if (onlyUnique() === true && !autoCompleteKey()) {
			matchs = matchs.filter((t) => !tags().includes(t.label));
		}

		$.set(arrelementsmatch, matchs, true);

		// Don't reset navigation index on ArrowUp/Down - keyup runs after keydown and would overwrite it
		if (keyCode !== 38 && keyCode !== 40) {
			$.set(autoCompleteIndex, $.get(autoCompleteIndexStart), true);
		}
	}

	var fragment = root_4();
	var div = $.first_child(fragment);
	let classes;
	var label = $.child(div);
	var text = $.only_child(label, true);
	var node = $.sibling(label, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, tags, $.index, ($$anchor, tagItem, i) => {
				var button = root_1();
				var node_2 = $.child(button);

				{
					var consequent = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(tagItem)));
						$.append($$anchor, text_1);
					};

					var alternate = ($$anchor) => {
						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(tagItem)[$.get(resolvedAutoCompleteShowKey)]));
						$.append($$anchor, text_2);
					};

					$.if(node_2, ($$render) => {
						if (typeof $.get(tagItem) === 'string') $$render(consequent); else $$render(alternate, -1);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var span = root();

						$.delegated('pointerdown', span, (e) => {
							e.preventDefault();
							removeTag(i);
						});

						$.append($$anchor, span);
					};

					$.if(node_3, ($$render) => {
						if (!disable() && !readonly()) $$render(consequent_1);
					});
				}

				$.reset(button);
				$.delegated('click', button, () => onTagClick()($.get(tagItem)));
				$.append($$anchor, button);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (tags().length > 0) $$render(consequent_2);
		});
	}

	var input_1 = $.sibling(node, 2);

	$.remove_input_defaults(input_1);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(layoutElement, $$value), () => $.get(layoutElement));

	var node_4 = $.sibling(div, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_3();
			var ul = $.child(div_1);

			$.each(ul, 21, () => $.get(arrelementsmatch), $.index, ($$anchor, element, index) => {
				var li = root_2();
				let classes_1;

				$.html(li, () => $.get(element).search, true);
				$.reset(li);
				$.template_effect(() => classes_1 = $.set_class(li, 1, 'svelte-1m7ml2m', null, classes_1, { focus: index === $.get(autoCompleteIndex) }));

				$.delegated('pointerdown', li, (e) => {
					e.preventDefault();
					addTag($.get(element).label);
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div_1);
			$.template_effect(() => $.set_attribute(ul, 'id', `${$.get(id) ?? ''}_matchs`));
			$.append($$anchor, div_1);
		};

		$.if(node_4, ($$render) => {
			if (autoComplete() && $.get(arrelementsmatch).length > 0) $$render(consequent_3);
		});
	}

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'svelte-tags-input-layout svelte-1m7ml2m', null, classes, {
			'sti-layout-disable': disable(),
			'sti-layout-readonly': readonly()
		});

		$.set_attribute(label, 'for', $.get(id));
		$.set_class(label, 1, $.clsx(labelShow() ? '' : 'sr-only'), 'svelte-1m7ml2m');
		$.set_text(text, $.get(resolvedLabelText));
		$.set_attribute(input_1, 'id', $.get(id));
		$.set_attribute(input_1, 'name', name());
		$.set_attribute(input_1, 'placeholder', $.get(displayPlaceholder));
		input_1.disabled = disable() || readonly();
	});

	$.delegated('keydown', input_1, setTag);
	$.delegated('keyup', input_1, getMatchElements);
	$.event('paste', input_1, onPaste);
	$.event('drop', input_1, onDrop);
	$.event('focus', input_1, onFocus);
	$.event('blur', input_1, (e) => onBlur(e, $.get(tagInput)));
	$.delegated('pointerdown', input_1, onClick);
	$.bind_value(input_1, () => $.get(tagInput), ($$value) => $.set(tagInput, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'pointerdown', 'keydown', 'keyup']);