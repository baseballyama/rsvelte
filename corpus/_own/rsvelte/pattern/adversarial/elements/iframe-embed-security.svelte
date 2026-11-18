<script>
	let src = $state('https://example.com');
</script>

<iframe
	{src}
	title="frame"
	sandbox="allow-scripts allow-same-origin"
	allow="fullscreen; camera 'none'"
	loading="lazy"
	referrerpolicy="no-referrer"
></iframe>

<object type="image/svg+xml" data="/d.svg" width="10" height="10" aria-label="o">
	fallback
</object>

<a href={src} target="_blank" rel="noreferrer noopener" download="file.txt">dl</a>
<a href="javascript:void(0)" aria-label="js">legacy-ish</a>
<a href="mailto:a@b.c?subject=hi&body=x">mail</a>
