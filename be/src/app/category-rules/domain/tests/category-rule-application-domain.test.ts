import { describe, expect, it } from 'vitest'
import { CategoryRuleApplicationDomain } from '../category-rule-application-domain'
import type { Category, CategoryRule } from '../domain-model'

const categories: Category[] = [
  {
    id: 'category-1',
    parentCategoryId: null,
    name: 'Housing',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subcategory-1',
    parentCategoryId: 'category-1',
    name: 'Rent',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
]

const createRule = (overrides: Partial<CategoryRule> = {}): CategoryRule => {
  return {
    id: 'rule-1',
    name: 'Rent rule',
    matchColumn: 'description',
    matchType: 'contains',
    matchValue: 'rent',
    categoryId: 'category-1',
    subcategoryId: 'subcategory-1',
    outflowClassification: 'positive_outflow',
    priority: 10,
    isEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('CategoryRuleApplicationDomain', () => {
  it('matches contains rules case-insensitively', () => {
    const domain = new CategoryRuleApplicationDomain()

    const assignment = domain.findAssignment({
      target: {
        normalizedDescription: 'online rent payment',
        amount: -100000
      },
      rules: [createRule()],
      categories
    })

    expect(assignment).toMatchObject({
      categoryId: 'category-1',
      categoryName: 'Housing',
      subcategoryId: 'subcategory-1',
      subcategoryName: 'Rent',
      outflowClassification: 'positive_outflow',
      appliedRuleId: 'rule-1'
    })
  })

  it('matches equals rules against normalized descriptions', () => {
    const domain = new CategoryRuleApplicationDomain()

    const assignment = domain.findAssignment({
      target: {
        normalizedDescription: 'payroll deposit',
        amount: 200000
      },
      rules: [
        createRule({
          matchType: 'equals',
          matchValue: 'Payroll   Deposit',
          outflowClassification: 'positive_outflow'
        })
      ],
      categories
    })

    expect(assignment?.categoryId).toBe('category-1')
    expect(assignment?.outflowClassification).toBe(null)
  })

  it('uses the first enabled matching rule', () => {
    const domain = new CategoryRuleApplicationDomain()

    const assignment = domain.findAssignment({
      target: {
        normalizedDescription: 'rent payment',
        amount: -100000
      },
      rules: [
        createRule({
          id: 'disabled-rule',
          isEnabled: false
        }),
        createRule({
          id: 'first-enabled-rule',
          name: 'First enabled'
        }),
        createRule({
          id: 'second-enabled-rule',
          name: 'Second enabled'
        })
      ],
      categories
    })

    expect(assignment?.appliedRuleId).toBe('first-enabled-rule')
  })
})
