<script>
	import { writable } from 'svelte/store';

	const i18n = writable({ languages: [] });
	// Assuming $i18n.languages is an array of language codes
	const languages = $i18n.languages;
</script>

<p>{languages.length}</p>
