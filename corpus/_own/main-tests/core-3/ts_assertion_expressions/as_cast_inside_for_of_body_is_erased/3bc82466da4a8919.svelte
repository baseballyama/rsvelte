<script lang="ts"></script><button onclick={(e) => {
	for (const el of document.querySelectorAll('x')) {
		(el as HTMLDetailsElement).open = false;
	}
	for (const k in e) {
		console.log((k as string).length);
	}
}}>x</button>