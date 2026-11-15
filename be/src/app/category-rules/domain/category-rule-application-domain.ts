import { normalizeTransactionDescription } from '../../../shared/transactions/transaction-description'
import type {
  Category,
  CategoryRule,
  CategoryRuleAssignment,
  RuleApplicationTarget
} from './domain-model'

export class CategoryRuleApplicationDomain {
  findAssignment = (input: {
    target: RuleApplicationTarget
    rules: CategoryRule[]
    categories: Category[]
  }): CategoryRuleAssignment | null => {
    const matchingRule = input.rules.find((rule) => {
      return this._ruleMatches({
        rule,
        target: input.target
      })
    })

    if (!matchingRule) {
      return null
    }

    const category = input.categories.find((candidate) => {
      return candidate.id === matchingRule.categoryId
    })

    if (!category) {
      return null
    }

    const subcategory = matchingRule.subcategoryId
      ? input.categories.find((candidate) => {
          return candidate.id === matchingRule.subcategoryId
        }) ?? null
      : null

    return {
      categoryId: category.id,
      categoryName: category.name,
      subcategoryId: subcategory?.id ?? null,
      subcategoryName: subcategory?.name ?? null,
      outflowClassification:
        input.target.amount < 0 ? matchingRule.outflowClassification : null,
      appliedRuleId: matchingRule.id,
      appliedRuleName: matchingRule.name
    }
  }

  private _ruleMatches = (input: {
    rule: CategoryRule
    target: RuleApplicationTarget
  }) => {
    if (!input.rule.isEnabled) {
      return false
    }

    const targetDescription = input.target.normalizedDescription
    const matchValue = normalizeTransactionDescription(input.rule.matchValue)

    if (input.rule.matchType === 'contains') {
      return targetDescription.includes(matchValue)
    }

    if (input.rule.matchType === 'equals') {
      return targetDescription === matchValue
    }

    return false
  }
}
