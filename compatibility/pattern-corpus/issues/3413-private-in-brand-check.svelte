<script>
  class Box {
    #value = 1;

    static holds(other) {
      return #value in other;
    }

    static pick(other) {
      return #value in other ? "yes" : "no";
    }

    static both(other, flag) {
      return #value in other && flag;
    }

    static guard(other) {
      if (#value in other) {
        return 1;
      }
      return 0;
    }

    static label(other) {
      const held = #value in other;
      return String(held);
    }
  }

  const held = Box.holds({});
</script>

<b>{held}</b>
