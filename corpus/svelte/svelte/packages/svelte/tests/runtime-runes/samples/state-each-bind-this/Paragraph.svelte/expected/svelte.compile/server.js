import * as $ from 'svelte/internal/server';

export default function Paragraph($$renderer, $$props) {
	const { text } = $$props;
	let boundParagraph = void 0;

	function changeBackgroundToRed() {
		boundParagraph.style.backgroundColor = 'red';
	}

	$$renderer.push(`<p>${$.escape(text)}</p>`);
	$.bind_props($$props, { changeBackgroundToRed });
}