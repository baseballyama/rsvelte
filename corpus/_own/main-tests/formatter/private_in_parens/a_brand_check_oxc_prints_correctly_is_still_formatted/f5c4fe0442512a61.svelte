<script>
  class Box {
    static #value;
        static holds(o) {
            return #value in o;
        }
  }
</script>
