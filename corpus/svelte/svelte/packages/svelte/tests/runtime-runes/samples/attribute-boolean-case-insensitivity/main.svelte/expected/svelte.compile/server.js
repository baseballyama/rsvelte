import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let runesMode = 'using a rune so that we trigger runes mode';
	const attributeValues = [true, 'test', false];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(attributeValues);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let val = each_array[$$index];

		$$renderer.push(`<script${$.attr('nomodule', val, true)}${$.attr('async', val, true)}${$.attr('defer', val, true)}></script>`);
		$$renderer.push(` <form${$.attr('novalidate', val, true)}></form> <input${$.attr('readonly', val, true)}${$.attr('required', val, true)}${$.attr('checked', val, true)}${$.attr('webkitdirectory', val, true)}/> <select${$.attr('multiple', val, true)}${$.attr('disabled', val, true)}></select> <button${$.attr('formnovalidate', val, true)}></button> <img${$.attr('ismap', val, true)}/> <video${$.attr('autoplay', val, true)}${$.attr('controls', val, true)}${$.attr('loop', val, true)}${$.attr('muted', val, true)}${$.attr('playsinline', val, true)}${$.attr('disablepictureinpicture', val, true)}${$.attr('disableremoteplayback', val, true)}></video> <audio${$.attr('disableremoteplayback', val, true)}></audio> <track${$.attr('default', val, true)}/> <iframe${$.attr('allowfullscreen', val, true)}></iframe> <details${$.attr('open', val, true)}></details> <ol${$.attr('reversed', val, true)}></ol> <div${$.attr('autofocus', val, true)}></div> <span${$.attr('inert', val, true)}></span>`);
	}

	$$renderer.push(`<!--]-->`);
}