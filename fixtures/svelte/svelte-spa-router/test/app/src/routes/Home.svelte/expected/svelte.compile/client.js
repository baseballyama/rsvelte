import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<h2 class="routetitle">Home!</h2> <p>Welcome to this sample code!</p> <p>Things to try:</p> <ul><li>Navigate around with the links and buttons (notice how certain links become active depending
        on the path</li> <li>Try pressing the browsers' back and forward buttons</li> <li>The "Replace current page" button will change the page without adding a new item in the
        history stack (try pressing the back button!)</li> <li>Manually change the URL's fragment/hash</li> <li>Try refreshing the page</li></ul>`,
	1
);

export default function Home($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}