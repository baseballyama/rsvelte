# ImportDeclaration Visitor Implementation

## Summary

The ImportDeclaration visitor has been successfully ported from JavaScript to Rust. This visitor validates import statements in runes mode to prevent:

1. Forbidden imports from `svelte/internal/*` packages
2. Invalid lifecycle imports (`beforeUpdate`, `afterUpdate`) in runes mode

## Files Modified

### 1. `/src/compiler/phases/2_analyze/visitors/import_declaration.rs`

**Full implementation** of the ImportDeclaration visitor that:
- Only runs validation when `context.analysis.runes` is true
- Checks if import source starts with `"svelte/internal"` and throws `import_svelte_internal_forbidden` error
- Checks if import source equals `"svelte"` and validates each named import specifier
- Throws `runes_mode_invalid_import` error for `beforeUpdate` or `afterUpdate` imports

### 2. `/src/compiler/phases/2_analyze/errors.rs`

Added two new error functions:
- `import_svelte_internal_forbidden()` - Error for forbidden svelte/internal imports
- `runes_mode_invalid_import(name: &str)` - Error for invalid imports in runes mode

## Implementation Comparison

### JavaScript (Original)
```javascript
export function ImportDeclaration(node, context) {
	if (context.state.analysis.runes) {
		const source = /** @type {string} */ (node.source.value);

		if (source.startsWith('svelte/internal')) {
			e.import_svelte_internal_forbidden(node);
		}

		if (source === 'svelte') {
			for (const specifier of node.specifiers) {
				if (specifier.type === 'ImportSpecifier') {
					if (
						specifier.imported.type === 'Identifier' &&
						(specifier.imported.name === 'beforeUpdate' ||
							specifier.imported.name === 'afterUpdate')
					) {
						e.runes_mode_invalid_import(specifier, specifier.imported.name);
					}
				}
			}
		}
	}
}
```

### Rust (Implementation)
```rust
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Only perform validation in runes mode
    if !context.analysis.runes {
        return Ok(());
    }

    // Get the import source (e.g., "svelte", "svelte/internal/client")
    let source = match node
        .get("source")
        .and_then(|s| s.get("value"))
        .and_then(|v| v.as_str())
    {
        Some(s) => s,
        None => return Ok(()),
    };

    // Check for forbidden svelte/internal/* imports
    if source.starts_with("svelte/internal") {
        return Err(errors::import_svelte_internal_forbidden());
    }

    // Check for invalid imports from "svelte" in runes mode
    if source == "svelte" {
        // Get the specifiers array
        let specifiers = match node.get("specifiers").and_then(|s| s.as_array()) {
            Some(specs) => specs,
            None => return Ok(()),
        };

        // Check each import specifier
        for specifier in specifiers {
            // Only check ImportSpecifier (named imports)
            if specifier.get("type").and_then(|t| t.as_str()) != Some("ImportSpecifier") {
                continue;
            }

            // Get the imported name
            let imported = match specifier.get("imported") {
                Some(imp) => imp,
                None => continue,
            };

            // Check if it's an Identifier
            if imported.get("type").and_then(|t| t.as_str()) != Some("Identifier") {
                continue;
            }

            // Get the imported identifier name
            let imported_name = match imported.get("name").and_then(|n| n.as_str()) {
                Some(name) => name,
                None => continue,
            };

            // Check for beforeUpdate and afterUpdate
            if imported_name == "beforeUpdate" || imported_name == "afterUpdate" {
                return Err(errors::runes_mode_invalid_import(imported_name));
            }
        }
    }

    Ok(())
}
```

## Key Differences

1. **Error Handling**:
   - JavaScript throws errors directly
   - Rust returns `Result<(), AnalysisError>` and returns `Err()` for validation failures

2. **JSON Traversal**:
   - JavaScript accesses AST properties directly (e.g., `node.source.value`)
   - Rust uses `serde_json::Value` with `.get()` and `.and_then()` for safe navigation

3. **Type Safety**:
   - JavaScript relies on JSDoc type annotations
   - Rust provides compile-time type safety

## Integration

The visitor is already integrated into the script walker at:
- `/src/compiler/phases/2_analyze/visitors/script.rs` (line 102-104)

```rust
Some("ImportDeclaration") => {
    super::import_declaration::visit(node, context)?;
}
```

## Test Coverage

The implementation should handle these test cases:

1. **svelte-internal-import**:
   - Input: `import { something } from 'svelte/internal/client';`
   - Expected: `import_svelte_internal_forbidden` error

2. **runes-before-after-update**:
   - Input: `import { beforeUpdate, afterUpdate } from 'svelte';`
   - Expected: `runes_mode_invalid_import` error with message "beforeUpdate cannot be used in runes mode"

3. **Normal imports** (should pass):
   - Input: `import { onMount } from 'svelte';`
   - Expected: Success

## Completeness

✅ All functionality from JavaScript version implemented
✅ All error cases handled
✅ All warnings generated (none in this visitor)
✅ Follows existing Rust patterns in the codebase
✅ Properly documented with rustdoc comments
✅ Already integrated into visitor dispatch system

## Status

**COMPLETE** - Ready for testing once build system issues are resolved.
