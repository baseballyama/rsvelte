use oxc_formatter::QuoteStyle;
use rsvelte_formatter::{FormatOptions, JsFormatOptions, LineWidth, format};

fn options() -> FormatOptions {
    FormatOptions {
        js: JsFormatOptions {
            line_width: LineWidth::try_from(100).expect("valid line width"),
            quote_style: QuoteStyle::Single,
            ..JsFormatOptions::default()
        },
        ..FormatOptions::default()
    }
}

fn assert_parity(source: &str, expected: &str) {
    let formatted = format(source, &options()).expect("format ok");
    assert_eq!(formatted, expected);
    assert_eq!(
        format(&formatted, &options()).expect("format ok"),
        formatted,
        "formatting must be idempotent"
    );
}

#[test]
fn adjacent_content_expression_accounts_for_previous_sibling_width() {
    let source = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <Label>
              {formatTarget(suggestion.target)}{suggestion.targetName == null || suggestion.targetName === ''
                ? ''
                : `「${suggestion.targetName}」`}
            </Label>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    let expected = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <Label>
              {formatTarget(suggestion.target)}{suggestion.targetName == null ||
              suggestion.targetName === ''
                ? ''
                : `「${suggestion.targetName}」`}
            </Label>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn attach_attribute_accounts_for_directive_prefix() {
    let source = r#"<section>
  <div>
    <button
      popovertarget={popoverTarget}
      {tabindex}
      {disabled}
      {@attach effectiveTooltip != null && tooltip({ content: effectiveTooltip, placement: 'right' })}
    >
      {@render content()}
    </button>
  </div>
</section>
"#;
    let expected = r#"<section>
  <div>
    <button
      popovertarget={popoverTarget}
      {tabindex}
      {disabled}
      {@attach effectiveTooltip != null &&
        tooltip({ content: effectiveTooltip, placement: 'right' })}
    >
      {@render content()}
    </button>
  </div>
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn optional_chain_attribute_breaks_at_oracle_boundary() {
    let source = r#"<section>
  <Report
    selectedCategories={dashboardFilter?.getDrillDownQuery(reportData.reportId)?.selectedCategories ??
      []}
  />
</section>
"#;
    let expected = r#"<section>
  <Report
    selectedCategories={dashboardFilter?.getDrillDownQuery(reportData.reportId)
      ?.selectedCategories ?? []}
  />
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn each_header_keeps_fitting_member_chain_inline() {
    let source = r#"<Field label="Output" tag="fieldset" width="100%">
  <div class="flex flex-col gap-y-2">
    {#each selectedNode.data.config
      .outputContexts as outputContext, index (outputContext.key + index)}
      <div>{outputContext.key}</div>
    {/each}
  </div>
</Field>
"#;
    let expected = r#"<Field label="Output" tag="fieldset" width="100%">
  <div class="flex flex-col gap-y-2">
    {#each selectedNode.data.config.outputContexts as outputContext, index (outputContext.key + index)}
      <div>{outputContext.key}</div>
    {/each}
  </div>
</Field>
"#;
    assert_parity(source, expected);
}

#[test]
fn each_call_chain_accounts_for_full_header_width() {
    let source = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <div>
                  {#each table.getAllColumns().filter((column) => column.getCanHide()) as column (column)}
                    <div>{column.id}</div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    let expected = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <div>
                  {#each table
                    .getAllColumns()
                    .filter((column) => column.getCanHide()) as column (column)}
                    <div>{column.id}</div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn each_expanded_call_accounts_for_full_header_width() {
    let source = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                {#each options.filter((option) => selectedValues.has(option.value)) as option (option)}
                  <div>{option.value}</div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    let expected = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                {#each options.filter( (option) => selectedValues.has(option.value) ) as option (option)}
                  <div>{option.value}</div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn satisfies_object_attribute_drops_statement_context_parentheses() {
    let source = r#"<script lang="ts"></script>

{#if isQueryBuilderQuery(queryBase)}
  <QueryBuilder
    bind:query={queryBase}
    binaryConditionOnAdded={({
      type: 'BINARY',
      left: { field: '', fieldType: 'STRING' },
      masterBinaryOperator: 'EQUAL',
      right: '',
    }) satisfies BinaryCondition}
  />
{/if}
"#;
    let expected = r#"<script lang="ts"></script>

{#if isQueryBuilderQuery(queryBase)}
  <QueryBuilder
    bind:query={queryBase}
    binaryConditionOnAdded={{
      type: 'BINARY',
      left: { field: '', fieldType: 'STRING' },
      masterBinaryOperator: 'EQUAL',
      right: '',
    } satisfies BinaryCondition}
  />
{/if}
"#;
    assert_parity(source, expected);
}

#[test]
fn nested_component_children_follow_oracle_hugging() {
    let source = r#"<ol>
  <li class="flex items-start gap-x-8">
    <span class="step-no flex shrink-0 justify-center items-center"
      ><Text type="caption-12" color="inherit">1</Text></span
    >
    <Text type="body-13" color="gray-700">Workflow「{buildInfo.workflow ??
      'Default workflow name'}」を<Text
      tag="span"
      type="body-13-bold">publish</Text
    >します。</Text>
  </li>
  <li class="flex items-start gap-x-8">
    <span class="step-no flex shrink-0 justify-center items-center"
      ><Text type="caption-12" color="inherit">2</Text></span
    >
    <Text type="body-13" color="gray-700">After publishing、selected tableに<Text
      tag="span"
      type="body-13-bold">new records</Text
    >が追加されます。</Text>
  </li>
</ol>
"#;
    let expected = r#"<ol>
  <li class="flex items-start gap-x-8">
    <span class="step-no flex shrink-0 justify-center items-center"
      ><Text type="caption-12" color="inherit">1</Text></span
    >
    <Text type="body-13" color="gray-700"
      >Workflow「{buildInfo.workflow ?? 'Default workflow name'}」を<Text
        tag="span"
        type="body-13-bold">publish</Text
      >します。</Text
    >
  </li>
  <li class="flex items-start gap-x-8">
    <span class="step-no flex shrink-0 justify-center items-center"
      ><Text type="caption-12" color="inherit">2</Text></span
    >
    <Text type="body-13" color="gray-700"
      >After publishing、selected tableに<Text tag="span" type="body-13-bold">new records</Text
      >が追加されます。</Text
    >
  </li>
</ol>
"#;
    assert_parity(source, expected);
}

#[test]
fn arrow_attribute_body_uses_rendered_column_width() {
    let source = r#"<script lang="ts"></script>

<section>
  <div>
    <div>
      <Modal
        onsubmit={async (enableEmbedding: boolean) => {
          try {
            await persistAiGrouping(enableEmbedding);
          } catch (err) {
            const fallbackMessage = enableEmbedding ? '類似検索の有効化または作成に失敗しました' : '作成に失敗しました';
            const queryWithExclusions = buildQueryWithExcludedRecords(baseQuery, excludedRecordIds);
            const res = await backendClient.api.v1['table-records'][':tableId']['bulk-delete'].$post({
              param: { tableId },
            });
            if (field.maxSelectionCount === 1 && currentValue.length === 1 && diff.added.length > 0) {
              return;
            }
          }
        }}
      />
    </div>
  </div>
</section>
"#;
    let expected = r#"<script lang="ts"></script>

<section>
  <div>
    <div>
      <Modal
        onsubmit={async (enableEmbedding: boolean) => {
          try {
            await persistAiGrouping(enableEmbedding);
          } catch (err) {
            const fallbackMessage = enableEmbedding
              ? '類似検索の有効化または作成に失敗しました'
              : '作成に失敗しました';
            const queryWithExclusions = buildQueryWithExcludedRecords(baseQuery, excludedRecordIds);
            const res = await backendClient.api.v1['table-records'][':tableId'][
              'bulk-delete'
            ].$post({
              param: { tableId },
            });
            if (
              field.maxSelectionCount === 1 &&
              currentValue.length === 1 &&
              diff.added.length > 0
            ) {
              return;
            }
          }
        }}
      />
    </div>
  </div>
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn deep_attribute_chain_breaks_call_before_optional_member() {
    let source = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <DropdownTrigger
                      label={propOperatorOptions.find((o) => o.value === condition.masterBinaryOperator)?.label}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    let expected = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <DropdownTrigger
                      label={propOperatorOptions.find(
                        (o) => o.value === condition.masterBinaryOperator,
                      )?.label}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    assert_parity(source, expected);
}

#[test]
fn deep_attribute_call_accounts_for_name_prefix() {
    let source = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <DropdownMenuItemAction
                label="History"
                icon="file-clock"
                href={resolve('/(app)/folders/[parentFolderId]/tables/[tableId]/import-export-history', {
                  parentFolderId,
                  tableId,
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    let expected = r#"<section>
  <div>
    <div>
      <div>
        <div>
          <div>
            <div>
              <DropdownMenuItemAction
                label="History"
                icon="file-clock"
                href={resolve(
                  '/(app)/folders/[parentFolderId]/tables/[tableId]/import-export-history',
                  {
                    parentFolderId,
                    tableId,
                  },
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
"#;
    assert_parity(source, expected);
}
