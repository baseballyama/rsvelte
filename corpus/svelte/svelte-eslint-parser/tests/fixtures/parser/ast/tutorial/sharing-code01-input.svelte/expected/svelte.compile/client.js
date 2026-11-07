import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AudioPlayer from './AudioPlayer.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Sharing_code01_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	AudioPlayer(node, {
		src: 'https://sveltejs.github.io/assets/music/strauss.mp3',
		title: 'The Blue Danube Waltz',
		composer: 'Johann Strauss',
		performer: 'European Archive'
	});

	var node_1 = $.sibling(node, 2);

	AudioPlayer(node_1, {
		src: 'https://sveltejs.github.io/assets/music/holst.mp3',
		title: 'Mars, the Bringer of War',
		composer: 'Gustav Holst',
		performer: 'USAF Heritage of America Band'
	});

	var node_2 = $.sibling(node_1, 2);

	AudioPlayer(node_2, {
		src: 'https://sveltejs.github.io/assets/music/satie.mp3',
		title: 'Gymnopédie no. 1',
		composer: 'Erik Satie',
		performer: 'Prodigal Procrastinator'
	});

	var node_3 = $.sibling(node_2, 2);

	AudioPlayer(node_3, {
		src: 'https://sveltejs.github.io/assets/music/beethoven.mp3',
		title: 'Symphony no. 5 in Cm, Op. 67 - I. Allegro con brio',
		composer: 'Ludwig van Beethoven',
		performer: 'European Archive'
	});

	var node_4 = $.sibling(node_3, 2);

	AudioPlayer(node_4, {
		src: 'https://sveltejs.github.io/assets/music/mozart.mp3',
		title: 'Requiem in D minor, K. 626 - III. Sequence - Lacrymosa',
		composer: 'Wolfgang Amadeus Mozart',
		performer: 'Markus Staab'
	});

	$.append($$anchor, fragment);
}