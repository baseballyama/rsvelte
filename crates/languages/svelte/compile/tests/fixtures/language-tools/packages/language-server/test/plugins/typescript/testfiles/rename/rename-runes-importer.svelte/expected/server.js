import * as $ from 'svelte/internal/server';
import RenameRunes from "./rename-runes.svelte";

export default function Rename_runes_importer($$renderer) {
	let foo = '';
	let bar = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RenameRunes($$renderer, {
			foo,
			get bar() {
				return bar;
			},

			set bar($$value) {
				bar = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		RenameRunes($$renderer, {
			foo,
			get bar() {
				return bar;
			},

			set bar($$value) {
				bar = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}