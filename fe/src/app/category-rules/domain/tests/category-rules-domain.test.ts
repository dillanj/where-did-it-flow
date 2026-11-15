import { describe, expect, it } from 'vitest'
import { CategoryRulesDomain } from '../category-rules-domain'
import type { CategoryRulesApiPort } from '../domain-ports'
import type { Category, CategoryRule } from '../domain-model'

const createApi = (): CategoryRulesApiPort & {
  categories: Category[]
  rules: CategoryRule[]
} => {
  const categories: Category[] = []
  const rules: CategoryRule[] = []

  return {
    categories,
    rules,
    listCategories: async () => {
      return [...categories]
    },
    createCategory: async (input) => {
      const category: Category = {
        id: `category-${categories.length + 1}`,
        parentCategoryId: input.parentCategoryId,
        name: input.name,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }

      categories.push(category)

      return category
    },
    updateCategory: async (input) => {
      const category = categories.find((candidate) => {
        return candidate.id === input.categoryId
      })

      if (!category) {
        throw new Error('missing category')
      }

      category.name = input.name
      category.parentCategoryId = input.parentCategoryId

      return category
    },
    deleteCategory: async (categoryId) => {
      const index = categories.findIndex((category) => {
        return category.id === categoryId
      })

      if (index >= 0) {
        categories.splice(index, 1)
      }
    },
    listRules: async () => {
      return [...rules]
    },
    createRule: async (input) => {
      const rule: CategoryRule = {
        id: `rule-${rules.length + 1}`,
        name: input.name,
        matchColumn: 'description',
        matchType: input.matchType,
        matchValue: input.matchValue,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        outflowClassification: input.outflowClassification,
        priority: input.priority,
        isEnabled: input.isEnabled,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }

      rules.push(rule)

      return rule
    },
    updateRule: async (input) => {
      const rule = rules.find((candidate) => {
        return candidate.id === input.ruleId
      })

      if (!rule) {
        throw new Error('missing rule')
      }

      rule.name = input.name
      rule.matchType = input.matchType
      rule.matchValue = input.matchValue
      rule.categoryId = input.categoryId
      rule.subcategoryId = input.subcategoryId
      rule.outflowClassification = input.outflowClassification
      rule.priority = input.priority
      rule.isEnabled = input.isEnabled

      return rule
    },
    deleteRule: async (ruleId) => {
      const index = rules.findIndex((rule) => {
        return rule.id === ruleId
      })

      if (index >= 0) {
        rules.splice(index, 1)
      }
    }
  }
}

describe('CategoryRulesDomain', () => {
  it('loads categories and rules', async () => {
    const api = createApi()
    api.categories.push({
      id: 'category-1',
      parentCategoryId: null,
      name: 'Food',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })
    const domain = new CategoryRulesDomain({
      api
    })

    await domain.initialize()

    expect(domain.categories.get()).toHaveLength(1)
    expect(domain.rules.get()).toHaveLength(0)

    domain.dispose()
  })

  it('creates a category and resets the category draft', async () => {
    const api = createApi()
    const domain = new CategoryRulesDomain({
      api
    })

    domain.updateCategoryDraft('name', 'Groceries')
    await domain.saveCategoryDraft()

    expect(domain.categories.get()[0]?.name).toBe('Groceries')
    expect(domain.categoryDraft.get().name).toBe('')
    expect(domain.message.get()).toBe('Category created.')

    domain.dispose()
  })

  it('defaults new rule priority to max priority plus ten', async () => {
    const api = createApi()
    api.rules.push({
      id: 'rule-1',
      name: 'Rent',
      matchColumn: 'description',
      matchType: 'contains',
      matchValue: 'rent',
      categoryId: 'category-1',
      subcategoryId: null,
      outflowClassification: null,
      priority: 30,
      isEnabled: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })
    const domain = new CategoryRulesDomain({
      api
    })

    await domain.initialize()
    domain.startCreateRule()

    expect(domain.ruleDraft.get().priority).toBe(40)

    domain.dispose()
  })

  it('validates rule drafts before saving', async () => {
    const api = createApi()
    const domain = new CategoryRulesDomain({
      api
    })

    await expect(domain.saveRuleDraft()).rejects.toThrow('Rule name is required.')

    domain.dispose()
  })
})
