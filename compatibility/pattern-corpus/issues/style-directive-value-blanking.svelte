<script lang="ts">
	let c = 'red';
	let color = 'red';
</script>

<!-- Every static run below is blanked to its whitespace; the quote survives.
     Interior double spaces are deliberately absent: the fmt oracle collapses
     them, and the leading/trailing pair carries the same axis. -->
<div style:--ring="234 89% 74%"></div>
<div style:color="red"></div>
<div style:color=" a "></div>
<div style:color='red'></div>
<div style:color=' a '></div>
<div style:color=""></div>
<div style:color=''></div>
<div style:color=red></div>

<!-- Controls: shapes that never reach the blanking rule. -->
<div style:color></div>
<div style:color={c}></div>
<div style:color="a{c}"></div>
<div style:color="rgb({c}, 0, 0)"></div>
<div style:color='rgb({c}, 0, 0)'></div>
