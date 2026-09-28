import * as $ from 'svelte/internal/server';

export default function MainTable($$renderer, $$props) {
	let {
		horizUnused,
		rendererCell,
		aggregatorCell,
		outputCell,
		unusedAttrsCell,
		colAttrsCell,
		rowAttrsCell
	} = $$props;

	if (horizUnused) {
		$$renderer.push(`<!--[0--><table class="pvtUi"><tbody><tr><td class="pvtRenderers">`);
		rendererCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtAxisContainer pvtUnused pvtHorizList">`);
		unusedAttrsCell($$renderer);
		$$renderer.push(`<!----></td></tr><tr><td class="pvtVals">`);
		aggregatorCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtAxisContainer pvtHorizList pvtCols">`);
		colAttrsCell($$renderer);
		$$renderer.push(`<!----></td></tr><tr><td class="pvtAxisContainer pvtVertList pvtRows">`);
		rowAttrsCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtOutput">`);
		outputCell($$renderer);
		$$renderer.push(`<!----></td></tr></tbody></table>`);
	} else {
		$$renderer.push(`<!--[-1--><table class="pvtUi"><tbody><tr><td class="pvtRenderers">`);
		rendererCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtVals">`);
		aggregatorCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtAxisContainer pvtHorizList pvtCols">`);
		colAttrsCell($$renderer);
		$$renderer.push(`<!----></td></tr><tr><td class="pvtAxisContainer pvtUnused pvtVertList">`);
		unusedAttrsCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtAxisContainer pvtVertList pvtRows">`);
		rowAttrsCell($$renderer);
		$$renderer.push(`<!----></td><td class="pvtOutput">`);
		outputCell($$renderer);
		$$renderer.push(`<!----></td></tr></tbody></table>`);
	}

	$$renderer.push(`<!--]-->`);
}