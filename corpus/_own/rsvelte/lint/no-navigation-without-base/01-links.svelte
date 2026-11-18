<script>
	import { base } from '$app/paths';
	void base;
</script>
<a href="/bad-plain">a</a>
<a href="#frag">ok</a>
<a href="https://example.com/x">ok</a>
<a href="mailto:x@y.example">ok</a>
<a href={base + '/ok'}>ok</a>
<a href={'/bad-expr'}>bad</a>
<a href="{base}/rest">ok</a>
<a href="/pre{base}">bad</a>
