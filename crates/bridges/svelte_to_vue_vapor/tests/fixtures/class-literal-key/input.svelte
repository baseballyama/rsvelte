<script>
  class Row {
    0 = $state(1);
    count;
    constructor() {
      this.count = $state(2);
    }
  }
  const row = new Row();
</script>
<p>{row[0]}:{row.count}</p>
