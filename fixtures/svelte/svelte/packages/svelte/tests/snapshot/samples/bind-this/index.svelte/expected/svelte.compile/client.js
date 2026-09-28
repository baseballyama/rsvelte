import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Bind_this($$anchor) {
	$.bind_this(Foo($$anchor, {}), ($$value) => foo = $$value, () => foo);
}