import * as $ from 'svelte/internal/server';

export default function FooterTextCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cell } = $$props;

		$$renderer.push(`<div class="footer-content"><span>${$.escape(cell.text)}</span> <i class="wxi-check"></i> `);

		$$renderer.push(`<style>
		.footer-content {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.footer-content i {
			display: inline-flex;
			font-size: 20px;
		}
	</style>`);

		$$renderer.push(`</div>`);
	});
}