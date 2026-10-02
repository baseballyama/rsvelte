import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div aria-valuemax="yes"></div> <div aria-valuemax="no"></div> <div${$.attr('aria-valuemax', `abc`)}></div> <div${$.attr('aria-valuemax', true)}></div> <div aria-valuemax="true"></div> <div aria-valuemax="false"></div> <div${$.attr('aria-valuemax', !'false')}></div>`);
}