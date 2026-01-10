# 次のタスク - 優先順位ガイド

**最終更新**: 2026-01-10
**現在の状態**: Overall 346/2830 tests (12.2%)

---

## 📋 2つの並行タスクパス

プロジェクトには現在、2つの主要な改善パスがあります:

### 🎯 [Phase 2: Validator 実装](./NEXT_TASK_PHASE2_VALIDATORS.md) ⭐ **推奨開始点**

**現状**: 82/312 tests (26.3%)
**推定改善**: 82 → 200+ tests (64%+)
**難易度**: 低-中
**推定期間**: 1-2 週間

**メリット:**
- ✅ **クイックウィン**: CSS validation (1-2日) で +19 tests
- ✅ **構造的改善**: scope_builder が OXC AST ベースに改善済み
- ✅ **明確な実装パス**: 優先順位と実装例が明確

**次のステップ:**
1. CSS :global() validation (1-2日) → 82 → 101 tests
2. 属性エラー validation (1.5日) → 101 → 116 tests
3. A11y 警告システム (4-6日) → 116 → 165+ tests

**詳細**: [NEXT_TASK_PHASE2_VALIDATORS.md](./NEXT_TASK_PHASE2_VALIDATORS.md)

---

### 🏗️ [Phase 3: Client Visitor 完成](./NEXT_TASK_2026-01-10.md)

**現状**: Compiler Snapshot 15/19 (78.9%), Runtime-runes 10/724 (1.4%)
**推定改善**: Snapshot 15 → 19 (100%), Runtime 10 → 100+ (13%+)
**難易度**: 高
**推定期間**: 2-4 週間

**メリット:**
- 🎯 **コアコード生成**: クライアントサイドの JS 生成完成
- 🎯 **実行時テスト改善**: Runtime-runes が大幅改善の可能性
- 🎯 **エンドツーエンド**: パース → 分析 → コード生成の完全パイプライン

**課題:**
- ⚠️ **複雑度高**: コード生成ロジックの理解が必要
- ⚠️ **テスト合格率低**: Runtime-runes が 1.4% と非常に低い
- ⚠️ **長期的取り組み**: 短期で大きな改善は難しい

**詳細**: [NEXT_TASK_2026-01-10.md](./NEXT_TASK_2026-01-10.md)

---

## 🎓 推奨アプローチ

### 新しい作業者の場合

**ステップ 1**: Phase 2 Validator 実装から開始
- 理由: 明確な実装パス、短期で成果が見える、難易度が低い
- 開始: [NEXT_TASK_PHASE2_VALIDATORS.md](./NEXT_TASK_PHASE2_VALIDATORS.md)

**ステップ 2**: Phase 2 で 60% 達成後、Phase 3 に移行
- 理由: Validator の知識がコード生成にも役立つ
- 開始: [NEXT_TASK_2026-01-10.md](./NEXT_TASK_2026-01-10.md)

### 経験豊富な作業者の場合

**並行作業**も可能:
- Phase 2 (CSS/属性 validation) を午前に実装
- Phase 3 (Client visitor) を午後に実装
- サブエージェントを活用して効率化

---

## 📈 期待される進捗予測

### 2週間後の目標
- **Phase 2 優先の場合**:
  - Validator: 82 → 180 (26% → 58%)
  - Overall: 346 → 444 (12% → 16%)

- **Phase 3 優先の場合**:
  - Compiler Snapshot: 15 → 19 (79% → 100%)
  - Runtime-runes: 10 → 50 (1% → 7%)
  - Overall: 346 → 385+ (12% → 14%)

### 1ヶ月後の目標
- **両方実施の場合**:
  - Validator: 82 → 250+ (26% → 80%+)
  - Runtime-runes: 10 → 150+ (1% → 20%+)
  - Overall: 346 → 700+ (12% → 25%+)

---

## 🚀 今すぐ始める

### Phase 2 Validator を選んだ場合

```bash
# 1. ドキュメントを読む
cat NEXT_TASK_PHASE2_VALIDATORS.md

# 2. 現状確認
cargo test --test validator 2>&1 | grep "Total:"

# 3. サブエージェントに調査を依頼
# "CSS :global() validation のテストケースを分析してください" (Explore agent)

# 4. 実装開始
# "src/compiler/phases/2_analyze/css/validator.rs を作成してください" (General-purpose agent)
```

### Phase 3 Client Visitor を選んだ場合

```bash
# 1. ドキュメントを読む
cat NEXT_TASK_2026-01-10.md

# 2. 現状確認
cargo test --test compiler_fixtures -- --nocapture 2>&1 | tail -50

# 3. 失敗テストの分析
# "compiler-snapshot の失敗しているテストを分析してください" (Explore agent)

# 4. 実装開始
# visitor の修正または新規実装
```

---

## 📚 関連ドキュメント

- [CLAUDE.md](./CLAUDE.md) - プロジェクト全体のガイド
- [TODO_QUICKSTART.md](./TODO_QUICKSTART.md) - Phase 2 の基礎ガイド
- [PHASE3_CLIENT_GUIDE.md](./PHASE3_CLIENT_GUIDE.md) - Phase 3 の実装ガイド

---

**注意**: どちらのパスを選んでも、頻繁にコミットして進捗を保存してください。サブエージェントを並列実行することで効率が大幅に向上します。
