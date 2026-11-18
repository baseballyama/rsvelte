<script>
  let choices = $state(['a']);
</script>
<select multiple bind:value={choices}>
  <option value="a">A</option>
  <option value="b">B</option>
  <option value="c">C</option>
</select>
<button onclick={() => choices = ['b', 'c']}>choose</button>
<p>{choices.join(',')}</p>
