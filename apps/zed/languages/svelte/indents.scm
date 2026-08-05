[
  (element)
  (if_statement)
  (each_statement)
  (await_statement)
  (snippet_statement)
  (script_element)
  (style_element)
  (start_tag ">" @end)
  (self_closing_tag "/>" @end)
  (element
    (start_tag) @start
    [(end_tag) (erroneous_end_tag)]? @end)
  (script_element
    (start_tag) @start
    [(end_tag) (erroneous_end_tag)]? @end)
  (style_element
    (start_tag) @start
    [(end_tag) (erroneous_end_tag)]? @end)
] @indent
