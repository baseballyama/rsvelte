import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {}

customElements.define('my-custom-element', $.create_custom_element(Input, {}, [], [], { mode: 'open' }));