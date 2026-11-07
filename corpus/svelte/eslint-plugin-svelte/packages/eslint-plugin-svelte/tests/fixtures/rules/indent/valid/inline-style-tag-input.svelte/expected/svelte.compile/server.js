import * as $ from 'svelte/internal/server';

export default function Inline_style_tag_input($$renderer) {
	$$renderer.push(`<svg>`);

	$$renderer.push(`<style>
    /* prettier-ignore */
    .test {
      fill: red;
    }
  </style>`);

	$$renderer.push(`</svg>`);
}