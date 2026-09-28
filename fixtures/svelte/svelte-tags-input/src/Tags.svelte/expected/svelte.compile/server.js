import * as $ from 'svelte/internal/server';

export default function Tags($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			tags = [],
			addKeys = [13],
			maxTags = false,
			onlyUnique = false,
			removeKeys = [8],
			placeholder = '',
			allowPaste = false,
			allowDrop = false,
			splitWith = ',',
			autoComplete = false,
			autoCompleteFilter = true,
			autoCompleteKey = false,
			autoCompleteMarkupKey = false,
			autoCompleteStartFocused = false,
			name = 'svelte-tags-input',
			id: idProp,
			allowBlur = false,
			disable = false,
			minChars = 1,
			onlyAutocomplete = false,
			labelText,
			labelShow = false,
			readonly = false,
			onTagClick = () => {},
			autoCompleteShowKey,
			onTagAdded = () => {},
			onTagRemoved = () => {},
			cleanOnBlur = false,
			customValidation = false
		} = $$props;

		let tagInput = '';
		let arrelementsmatch = [];
		let layoutElement = null;
		let generatedId = 'sti_' + Math.random().toString(36).substring(2, 11);
		let id = $.derived(() => idProp || generatedId);
		let matchsID = $.derived(() => id() + '_matchs');
		let autoCompleteIndexStart = $.derived(() => autoCompleteStartFocused ? 0 : -1);
		let autoCompleteIndex = -1;
		let displayPlaceholder = $.derived(() => maxTags && tags.length >= maxTags ? '' : placeholder);
		let resolvedLabelText = $.derived(() => labelText ?? name);
		let resolvedAutoCompleteShowKey = $.derived(() => autoCompleteShowKey ?? autoCompleteKey);

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
			const matches = document.getElementById(matchsID());
			const focusedElement = matches?.querySelector('li.focus')?.textContent;
			const currentTag = focusedElement ?? e.target.value;
			const keyCode = e.keyCode ?? keyCodeMap[e.key];

			if (addKeys) {
				addKeys.forEach(function (key) {
					if (key === keyCode) {
						if (currentTag) e.preventDefault();

						if (autoComplete && onlyAutocomplete && document.getElementById(matchsID())) {
							addTag(arrelementsmatch?.[autoCompleteIndex]?.label);
						} else {
							addTag(currentTag);
						}
					}
				});
			}

			if (removeKeys) {
				removeKeys.forEach(function (key) {
					if (key === keyCode && tagInput === '' && tags.length > 0) {
						removeTag(tags.length - 1);
					}
				});
			}

			if (keyCode === 40 && autoComplete && document.getElementById(matchsID())) {
				autoCompleteIndex++;

				if (autoCompleteIndex >= arrelementsmatch.length || autoCompleteIndex < 0) {
					autoCompleteIndex = 0;
				}
			} else if (keyCode === 38) {
				autoCompleteIndex--;

				if (autoCompleteIndex < 0 || autoCompleteIndex >= arrelementsmatch.length) {
					autoCompleteIndex = arrelementsmatch.length - 1;
				}
			} else if (keyCode === 27) {
				arrelementsmatch = [];
				document.getElementById(id()).focus();
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
				if (!autoCompleteKey) {
					return console.error("'autoCompleteKey' is necessary if 'autoComplete' result is an array of objects");
				}

				if (onlyUnique) {
					let found = tags?.find((elem) => elem[autoCompleteKey] === currentTag[autoCompleteKey]);

					if (found) return;
				}

				currentObjTags = currentTag;
				currentTag = currentTag[autoCompleteKey].trim();
			} else {
				currentTag = (currentTag ?? '').trim();
			}

			if (currentTag == '') return;
			if (maxTags && tags.length == maxTags) return;
			if (onlyUnique && tags.includes(currentTag)) return;
			if (onlyAutocomplete && arrelementsmatch.length === 0) return;
			if (customValidation && !customValidation(currentTag)) return;

			tags = [...tags, currentObjTags ? currentObjTags : currentTag];
			tagInput = '';
			onTagAdded(currentTag, tags);
			arrelementsmatch = [];
			autoCompleteIndex = autoCompleteIndexStart();
			document.getElementById(id()).focus();

			if (maxTags && tags.length == maxTags) {
				document.getElementById(id()).readOnly = true;
			}
		}

		/**
		 * Removes tag at index, calls onTagRemoved with the removed tag.
		 * @param {number} i - Index of tag to remove
		 * @returns {void}
		 */
		function removeTag(i) {
			const removed = tags[i];

			tags = tags.filter((_, idx) => idx !== i);
			onTagRemoved(removed, tags);
			arrelementsmatch = [];
			document.getElementById(id()).readOnly = false;
			document.getElementById(id()).focus();
		}

		/**
		 * Handles paste: splits by splitWith and adds each tag (if allowPaste).
		 * @param {ClipboardEvent} e - Paste event
		 * @returns {void}
		 */
		function onPaste(e) {
			if (!allowPaste) return;

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
			if (!allowDrop) return;

			e.preventDefault();

			const data = e.dataTransfer.getData('Text');

			splitTags(data).map((t) => addTag(t));
		}

		/**
		 * Adds focus class to layout on input focus.
		 * @returns {void}
		 */
		function onFocus() {
			layoutElement?.classList.add('focus');
		}

		/**
		 * Handles blur: optionally adds tag (allowBlur), clears input (cleanOnBlur).
		 * @param {FocusEvent} e - Blur event
		 * @param {string} currentTag - Current input value
		 * @returns {void}
		 */
		function onBlur(e, currentTag) {
			layoutElement?.classList.remove('focus');

			if (allowBlur) {
				if (arrelementsmatch.length && autoCompleteIndex > -1) {
					addTag(arrelementsmatch?.[autoCompleteIndex]?.label);
				} else if (!arrelementsmatch.length) {
					e.preventDefault();
					addTag(currentTag);
				}
			}

			if (cleanOnBlur) {
				tagInput = '';
			}

			arrelementsmatch = [];
			autoCompleteIndex = autoCompleteIndexStart();
		}

		/**
		 * On input click: shows all autocomplete matches when minChars is 0.
		 * @returns {void}
		 */
		function onClick() {
			if (minChars == 0) getMatchElements();
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
			return data.split(splitWith).map((t) => t.trim());
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
			if (!autoComplete) return;
			if (maxTags && tags.length >= maxTags) return;

			let value = input ? input.target.value : '';
			let autoCompleteValues = [];

			if (Array.isArray(autoComplete)) {
				autoCompleteValues = autoComplete;
			}

			if (typeof autoComplete === 'function') {
				if (autoComplete.constructor.name === 'AsyncFunction') {
					autoCompleteValues = await autoComplete(value);
				} else {
					autoCompleteValues = autoComplete(value);
				}
			}

			if (autoCompleteValues.constructor.name === 'Promise') {
				autoCompleteValues = await autoCompleteValues;
			}

			const keyCode = input?.keyCode ?? keyCodeMap[input?.key];

			if (minChars > 0 && value == '' || input && keyCode === 27 || value.length < minChars) {
				arrelementsmatch = [];

				return;
			}

			let matchs = autoCompleteValues;

			if (typeof autoCompleteValues[0] === 'object' && autoCompleteValues !== null) {
				if (!autoCompleteKey) {
					return console.error("'autoCompleteValue' is necessary if 'autoComplete' result is an array of objects");
				}

				if (autoCompleteFilter !== false) {
					matchs = autoCompleteValues.filter((e) => e[autoCompleteKey].toLowerCase().includes(value.toLowerCase()));
				}

				matchs = matchs.map((matchTag) => ({
					label: matchTag,
					search: autoCompleteMarkupKey
						? matchTag[autoCompleteMarkupKey]
						: buildMatchMarkup(value, matchTag[autoCompleteKey])
				}));
			} else {
				if (autoCompleteFilter !== false) {
					matchs = autoCompleteValues.filter((e) => e.toLowerCase().includes(value.toLowerCase()));
				}

				matchs = matchs.map((matchTag) => ({ label: matchTag, search: buildMatchMarkup(value, matchTag) }));
			}

			if (onlyUnique === true && !autoCompleteKey) {
				matchs = matchs.filter((t) => !tags.includes(t.label));
			}

			arrelementsmatch = matchs;

			// Don't reset navigation index on ArrowUp/Down - keyup runs after keydown and would overwrite it
			if (keyCode !== 38 && keyCode !== 40) {
				autoCompleteIndex = autoCompleteIndexStart();
			}
		}

		$$renderer.push(`<div${$.attr_class('svelte-tags-input-layout svelte-1m7ml2m', void 0, {
			'sti-layout-disable': disable,
			'sti-layout-readonly': readonly
		})}><label${$.attr('for', id())}${$.attr_class($.clsx(labelShow ? '' : 'sr-only'), 'svelte-1m7ml2m')}>${$.escape(resolvedLabelText())}</label> `);

		if (tags.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(tags);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let tagItem = each_array[i];

				$$renderer.push(`<button type="button" class="svelte-tags-input-tag svelte-1m7ml2m">`);

				if (typeof tagItem === 'string') {
					$$renderer.push(`<!--[0-->${$.escape(tagItem)}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(tagItem[resolvedAutoCompleteShowKey()])}`);
				}

				$$renderer.push(`<!--]--> `);

				if (!disable && !readonly) {
					$$renderer.push(`<!--[0--><span role="button" tabindex="-1" class="svelte-tags-input-tag-remove svelte-1m7ml2m">×</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></button>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <input type="text"${$.attr('id', id())}${$.attr('name', name)}${$.attr('value', tagInput)} class="svelte-tags-input svelte-1m7ml2m"${$.attr('placeholder', displayPlaceholder())}${$.attr('disabled', disable || readonly, true)} autocomplete="off"/></div> `);

		if (autoComplete && arrelementsmatch.length > 0) {
			$$renderer.push(`<!--[0--><div class="svelte-tags-input-matchs-parent svelte-1m7ml2m"><ul${$.attr('id', `${$.stringify(id())}_matchs`)} class="svelte-tags-input-matchs svelte-1m7ml2m"><!--[-->`);

			const each_array_1 = $.ensure_array_like(arrelementsmatch);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let element = each_array_1[index];

				$$renderer.push(`<li tabindex="-1"${$.attr_class('svelte-1m7ml2m', void 0, { 'focus': index === autoCompleteIndex })}>${$.html(element.search)}</li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { tags });
	});
}