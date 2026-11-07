import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let dynamic = '';

	$$renderer.push(`<input type="text"/> <input type="text" autocomplete="name"/> <input type="text" autocomplete="off"/> <input type="text" autocomplete="on"/> <input type="text" autocomplete="billing family-name"/> <input type="hidden" autocomplete="section-blue shipping street-address"/> <input type="text" autocomplete="section-somewhere shipping work email"/> <input type="text" autocomplete="section-somewhere shipping work email webauthn"/> <input type="text" autocomplete="SECTION-SOMEWHERE SHIPPING WORK EMAIL WEBAUTHN"/> <input type="TEXT" autocomplete="ON"/> <input type="email" autocomplete="url"/> <input type="text" autocomplete="section-blue shipping street-address"/> <input type="hidden" autocomplete="off"/> <input type="hidden" autocomplete="on"/> <input type="text" autocomplete=""/> <input${$.attr('type', dynamic)} autocomplete=""/> <input type="text"${$.attr('autocomplete', dynamic)}/> <input type="text" autocomplete=""/> <input type="text" autocomplete="incorrect"/> <input type="text" autocomplete="webauthn"/>`);
}