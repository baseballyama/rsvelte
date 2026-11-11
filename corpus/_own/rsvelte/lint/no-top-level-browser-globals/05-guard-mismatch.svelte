<script>
	if (typeof localStorage !== 'undefined') {
		document.title = 'not guarded by the localStorage check';
		localStorage.getItem('ok');
	}
	if (typeof window !== 'undefined') {
		document.body.classList.add('guarded-by-window');
	}
</script>
<p>guard name mismatch</p>
