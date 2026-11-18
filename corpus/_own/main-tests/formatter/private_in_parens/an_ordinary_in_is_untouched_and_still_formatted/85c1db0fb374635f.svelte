<script>
  class Box {
        static holds(o) {
            return "k" in (o || {});
        }
  }
</script>
