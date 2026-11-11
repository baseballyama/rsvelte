<script>
  class Box {
    static #value;
    static holds(o, p) {
      return #value in (o ? o : p);
    }
  }
</script>
