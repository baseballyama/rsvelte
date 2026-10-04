<script>
  let value = $state('first');
</script>

<table>
  <tbody>
    <tr><td>{value}</td><td>second</td></tr>
  </tbody>
</table>
<button onclick={() => (value = 'changed')}>change</button>
