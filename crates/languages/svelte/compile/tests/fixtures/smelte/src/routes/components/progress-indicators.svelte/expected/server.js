import * as $ from 'svelte/internal/server';
import ProgressLinear from "components/ProgressLinear";
import ProgressCircular from "components/ProgressCircular";
import Code from "docs/Code.svelte";
import indicators from "examples/progress-indicators.txt";

export default function Progress_indicators($$renderer) {
	let progress = 0;

	function next() {
		setTimeout(
			() => {
				if (progress === 100) {
					progress = 0;
				}

				progress += 1;
				next();
			},
			100
		);
	}

	next();
	$$renderer.push(`<h5 class="pb-4">Indefinite linear progress indicator</h5> `);
	ProgressLinear($$renderer, {});
	$$renderer.push(`<!----> <h5 class="pt-6 pb-4">Definite linear progress indicator</h5> <small class="mb-3">${$.escape(progress)}%</small> `);
	ProgressLinear($$renderer, { progress });
	$$renderer.push(`<!----> <h5 class="pt-6 pb-4">Indefinite circular progress indicator</h5> `);
	ProgressCircular($$renderer, {});
	$$renderer.push(`<!----> <h5 class="pt-6 pb-4">Definite circular progress indicator</h5> <small class="mb-3">${$.escape(progress)}%</small> `);
	ProgressCircular($$renderer, { progress });
	$$renderer.push(`<!----> `);
	Code($$renderer, { code: indicators });
	$$renderer.push(`<!---->`);
}