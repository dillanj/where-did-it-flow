import { useSignalValue } from '@tcn/state'
import type { CategoryRulesPresenter } from '../../presenter/category-rules-presenter'
import { CategoryForm } from './category-form'
import { RuleForm } from './rule-form'
import { RuleList } from './rule-list'

export type CategoryRulesPanelProps = {
  presenter: CategoryRulesPresenter
}

export const CategoryRulesPanel = ({ presenter }: CategoryRulesPanelProps) => {
  const broadcasts = presenter.broadcasts
  const categories = useSignalValue(broadcasts.categories)
  const rules = useSignalValue(broadcasts.rules)
  const categoryDraft = useSignalValue(broadcasts.categoryDraft)
  const ruleDraft = useSignalValue(broadcasts.ruleDraft)
  const editingCategoryId = useSignalValue(broadcasts.editingCategoryId)
  const editingRuleId = useSignalValue(broadcasts.editingRuleId)
  const message = useSignalValue(broadcasts.message)
  const topLevelCategoryOptions = useSignalValue(broadcasts.topLevelCategoryOptions)
  const allCategoryOptions = useSignalValue(broadcasts.allCategoryOptions)
  const subcategoryOptions = useSignalValue(broadcasts.subcategoryOptions)
  const isSavingCategory = useSignalValue(broadcasts.isSavingCategory)
  const isDeletingCategory = useSignalValue(broadcasts.isDeletingCategory)
  const isSavingRule = useSignalValue(broadcasts.isSavingRule)
  const isDeletingRule = useSignalValue(broadcasts.isDeletingRule)
  const errorMessage = useSignalValue(broadcasts.errorMessage)

  return (
    <section className='rules-grid'>
      <article className='panel'>
        <header className='panel-header'>
          <h2>Categories</h2>
          <span>{categories.length} total</span>
        </header>

        <CategoryForm
          draft={categoryDraft}
          topLevelCategoryOptions={topLevelCategoryOptions}
          editingCategoryId={editingCategoryId}
          isSaving={isSavingCategory}
          onChange={presenter.updateCategoryDraft}
          onSave={() => {
            void presenter.saveCategoryDraft()
          }}
          onCancel={presenter.startCreateCategory}
        />

        <div className='category-list'>
          {categories.length > 0 ? (
            categories.map((category) => {
              return (
                <div key={category.id} className='category-row'>
                  <div>
                    <strong>
                      {
                        allCategoryOptions.find((option) => {
                          return option.id === category.id
                        })?.label
                      }
                    </strong>
                  </div>
                  <div className='rule-actions'>
                    <button
                      type='button'
                      onClick={() => {
                        presenter.startEditCategory(category.id)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type='button'
                      disabled={isDeletingCategory}
                      onClick={() => {
                        void presenter.deleteCategory(category.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <p className='empty-state'>No categories yet.</p>
          )}
        </div>
      </article>

      <article className='panel'>
        <header className='panel-header'>
          <h2>Rules</h2>
          <span>{rules.length} total</span>
        </header>

        <RuleForm
          draft={ruleDraft}
          topLevelCategoryOptions={topLevelCategoryOptions}
          subcategoryOptions={subcategoryOptions}
          editingRuleId={editingRuleId}
          isSaving={isSavingRule}
          onChange={presenter.updateRuleDraft}
          onSave={() => {
            void presenter.saveRuleDraft()
          }}
          onCancel={presenter.startCreateRule}
        />

        <RuleList
          categories={categories}
          allCategoryOptions={allCategoryOptions}
          rules={rules}
          isDeleting={isDeletingRule}
          onEdit={presenter.startEditRule}
          onDelete={(ruleId) => {
            void presenter.deleteRule(ruleId)
          }}
        />

        {errorMessage ? <p className='status error'>{errorMessage}</p> : null}
        {message ? <p className='status'>{message}</p> : null}
      </article>
    </section>
  )
}
