<script>import Option from './Option.svelte'; let x = $state(1); let html = '';</script>
<div>
<select>
	<Option />
</select>
</div>
<select>
	<optgroup label="G">
		<Option />
	</optgroup>
	{@html html}
</select>
<select value={x}>
	<Option />
	<option><b>{x}</b></option>
</select>
