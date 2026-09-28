import * as $ from 'svelte/internal/server';
import CodeBlock from '$site/components/CodeBlock.svelte';
import dedent from 'dedent';

export default function CodeSample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			code,
			filename = '',
			startBoundary = '',
			endBoundary = '<CodeSample',
			omitStartBoundary = false,
			omitEndBoundary = true,
			language = 'svelte'
		} = $$props;

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

			if (filename) {
				outputCode = `<!-- File: ${filename} -->\n${outputCode}`;
			}

			outputCode = outputCode.replaceAll('$lib', 'svelte-maplibre');

			return outputCode;
		}

		let output = $.derived(() => getExtract(code, startBoundary, endBoundary, omitStartBoundary, omitEndBoundary));

		$$renderer.push(`<div class="my-4 flex w-full flex-col items-stretch">`);
		CodeBlock($$renderer, { language, code: output() });
		$$renderer.push(`<!----></div>`);
	});
}