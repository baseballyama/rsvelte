import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fileupload } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'files',
	'size',
	'clearable',
	'elementRef',
	'class',
	'classes',
	'clearableSvgClass',
	'clearableColor',
	'clearableClass',
	'clearableOnClick',
	'wrapperClass'
]);

var root = $.from_html(`<div><input/> <!></div>`);

export default function Fileupload($$anchor, $$props) {
	$.push($$props, true);

	let files = $.prop($$props, 'files', 15),
		size = $.prop($$props, 'size', 3, "md"),
		clearable = $.prop($$props, 'clearable', 3, false),
		elementRef = $.prop($$props, 'elementRef', 15),
		clearableColor = $.prop($$props, 'clearableColor', 3, "none"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Fileupload",
		untrack(() => ({
			wrapperClass: $$props.wrapperClass,
			clearableClass: $$props.clearableClass,
			clearableSvgClass: $$props.clearableSvgClass
		})),
		{
			wrapperClass: "wrapper",
			clearableClass: "close",
			clearableSvgClass: "svg"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		wrapper: $$props.wrapperClass,
		close: $$props.clearableClass,
		svg: $$props.clearableSvgClass
	});

	const theme = $.derived(() => getTheme("fileupload"));
	const { base, wrapper, close } = fileupload();

	const clearAll = () => {
		if (elementRef()) {
			elementRef(elementRef().value = "", true);
			files(undefined);
		}

		if ($$props.clearableOnClick) $$props.clearableOnClick();
	};

	createDismissableContext(clearAll);

	var div = root();
	var input = $.child(div);

	$.attribute_effect(
		input,
		($0) => ({ type: 'file', ...restProps, class: $0 }),
		[
			() => base({ size: size(), class: clsx($.get(theme)?.base, $$props.class) })
		],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => elementRef($$value), () => elementRef());

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => close({ class: clsx($.get(theme)?.close, $.get(styling).close) }));
				let $1 = $.derived(() => clsx($.get(styling).svg));

				CloseButton($$anchor, {
					get class() {
						return $.get($0);
					},

					get color() {
						return clearableColor();
					},
					'aria-label': 'Clear selected files',
					get svgClass() {
						return $.get($1);
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if (files() && files().length > 0 && clearable()) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(wrapper({ class: clsx($.get(theme)?.wrapper, $.get(styling).wrapper) }))
	]);

	$.bind_files(input, files);
	$.append($$anchor, div);
	$.pop();
}