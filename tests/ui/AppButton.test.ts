import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import AppButton from '~/shared/ui/AppButton.vue'

describe('AppButton', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(AppButton, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('renders as button by default', async () => {
    const wrapper = await mountSuspended(AppButton)
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('renders as anchor when tag="a"', async () => {
    const wrapper = await mountSuspended(AppButton, {
      props: { tag: 'a' },
    })
    expect(wrapper.element.tagName).toBe('A')
  })

  it('applies variant class', async () => {
    const wrapper = await mountSuspended(AppButton, {
      props: { variant: 'outline' },
    })
    expect(wrapper.classes()).toContain('btn_outline')
  })

  it('applies size class', async () => {
    const wrapper = await mountSuspended(AppButton, {
      props: { size: 'lg' },
    })
    expect(wrapper.classes()).toContain('btn_lg')
  })

  it('applies full class when full=true', async () => {
    const wrapper = await mountSuspended(AppButton, {
      props: { full: true },
    })
    expect(wrapper.classes()).toContain('btn_full')
  })

  it('defaults to accent variant and md size', async () => {
    const wrapper = await mountSuspended(AppButton)
    expect(wrapper.classes()).toContain('btn_accent')
    expect(wrapper.classes()).toContain('btn_md')
  })

  it('passes through native attrs', async () => {
    const wrapper = await mountSuspended(AppButton, {
      attrs: { disabled: true, type: 'submit' },
    })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
    expect(wrapper.attributes('type')).toBe('submit')
  })
})
