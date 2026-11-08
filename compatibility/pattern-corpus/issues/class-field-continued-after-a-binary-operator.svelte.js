export class Flags {
  static FLAG_THAT_SELECTS_THE_FIRST_BEHAVIOUR = 1;
  static FLAG_THAT_SELECTS_THE_SECOND_BEHAVIOUR = 2;
  static ALL =
    Flags.FLAG_THAT_SELECTS_THE_FIRST_BEHAVIOUR |
    Flags.FLAG_THAT_SELECTS_THE_SECOND_BEHAVIOUR;
  enabled =
    this.configuration_value_that_is_long !== undefined &&
    this.configuration_value_that_is_long > 0;
  label =
    "a label that is long enough to wrap the line" +
    " and a suffix that is also quite long";
  count = $state(0);
  incrementBy(
    amount_that_is_long_enough_to_wrap_the_line,
    step_that_is_also_long_enough_to_wrap_the_line,
  ) {
    this.count +=
      amount_that_is_long_enough_to_wrap_the_line *
      step_that_is_also_long_enough_to_wrap_the_line;
  }
}
