import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeBlock from '$site/components/CodeBlock.svelte';
import dedent from 'dedent';

var root = $.from_html(`<div class="my-4 flex w-full flex-col items-stretch"><!></div>`);

export default function CodeSample($$anchor, $$props) {
	$.push($$props, true);

	let filename = $.prop($$props, 'filename', 3, ''),
		startBoundary = $.prop($$props, 'startBoundary', 3, ''),
		endBoundary = $.prop($$props, 'endBoundary', 3, '<CodeSample'),
		omitStartBoundary = $.prop($$props, 'omitStartBoundary', 3, false),
		omitEndBoundary = $.prop($$props, 'omitEndBoundary', 3, true),
		language = $.prop($$props, 'language', 3, 'svelte');

	function getExtract(
		code,
		start,
		end,
		omitStartBoundary = false,
		omitEndBoundary = false
	) {
		let startIndex = start.length ? code.indexOf(start) : 0;
		let endIndex = end.length ? code.indexOf(end, startIndex) : code.length;

		if (!omitEndBoundary) {
			endIndex += end.length;
		}

		if (omitStartBoundary) {
			// Assume that the boundary text is on its own line when we're using this.
			startIndex = code.indexOf('\n', startIndex) + 1;
		}

		let outputCode = code.slice(startIndex, endIndex);

		// Dedent the snippet if every single nonblank line starts with whitespace. This is needed
		// because dedent ignores non-indented lines when figuring out how much to dedent, but in this
		// case we do want to account for that.
		const needsDedent = outputCode.split('\n').every((line) => {
			return !line || (/^\s+/).test(line);
		});

		if (needsDedent) {
			outputCode = dedent(outputCode);
		}

		outputCode = outputCode.trim();

		if (filename()) {
			outputCode = `<!-- File: ${filename()} -->\n${outputCode}`;
		}

		outputCode = outputCode.replaceAll('$lib', 'svelte-maplibre');

		return outputCode;
	}

	let output = $.derived(() => getExtract($$props.code, startBoundary(), endBoundary(), omitStartBoundary(), omitEndBoundary()));
	var div = root();
	var node = $.child(div);

	CodeBlock(node, {
		get language() {
			return language();
		},

		get code() {
			return $.get(output);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}