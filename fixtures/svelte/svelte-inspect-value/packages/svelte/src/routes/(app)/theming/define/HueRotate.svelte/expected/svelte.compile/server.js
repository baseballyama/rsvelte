import * as $ from 'svelte/internal/server';

export default function HueRotate($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rotation = 0, oncancel, onapply } = $$props;

		$$renderer.push(`<div class="flex row gap align-center justify-center"><label class="flex row">hue rotate <div class="flex row"><input${$.attributes(
			{
				type: 'range',
				min: -360,
				max: 360,
				value: rotation,
				defaultvalue: 0
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <input${$.attributes(
			{
				type: 'number',
				min: -360,
				max: 360,
				value: rotation,
				defaultvalue: 0
			},
			void 0,
			void 0,
			void 0,
			4
		)}/></div></label> <button type="button" title="clear rotation" class="unstyled"${$.attr('disabled', rotation === 0, true)}>cancel</button> <button type="button" title="apply rotation"${$.attr('disabled', rotation === 0, true)} class="unstyled">apply</button></div>`);

		$.bind_props($$props, { rotation });
	});
}