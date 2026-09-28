import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function FonttRoboto($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.html(node, () => `<style>
@font-face {
font-family: 'Roboto';
font-style: normal;
font-weight: 400;
src: local(''),
    url('https://cdn.svar.dev/fonts/roboto/regular.woff2') format('woff2'),
    url('https://cdn.svar.dev/fonts/roboto/regular.woff') format('woff');
}
@font-face {
font-family: 'Roboto';
font-style: normal;
font-weight: 500;
src: local(''),
    url('https://cdn.svar.dev/fonts/roboto/500.woff2') format('woff2'),
    url('https://cdn.svar.dev/fonts/roboto/500.woff') format('woff');
}
</style>`);

	$.append($$anchor, fragment);
}