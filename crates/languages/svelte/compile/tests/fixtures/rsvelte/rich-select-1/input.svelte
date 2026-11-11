<script>let x = $state(1);</script>
<select>
	<option><span>Rich {x}</span></option>
	<option value="b"><em>Italic</em> text</option>
</select>
<select bind:value={x}>
	<optgroup label="G">
		<option><strong>Bold</strong></option>
	</optgroup>
</select>
