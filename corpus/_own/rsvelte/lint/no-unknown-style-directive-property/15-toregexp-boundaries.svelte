<script>
	/* Upstream `toRegExp` only treats a string as a regex when it matches
	   /^\/(.+)\/([A-Za-z]*)$/u, and then passes the flags verbatim to `new RegExp`. */
	/* eslint svelte/no-unknown-style-directive-property: ["warn", { ignoreProperties: ["//", "/a/1", "/b/gy", "/c/", "/\\d+/"] }] */
</script>

<div style:zzz-a-zzz="1">a</div>
<div style:a-zzz="1">b</div>
<div style:zzz-b-zzz="1">c</div>
<div style:b-zzz="1">d</div>
<div style:zzz-c-zzz="1">e</div>
<div style:zzz-9-zzz="1">f</div>
<div style:zzz="1">g</div>
