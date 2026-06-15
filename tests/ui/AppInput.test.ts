import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import AppInput from '~/shared/ui/AppInput.vue'

describe('AppInput', () => {
  it('renders input element', async () => {
    const wrapper = await mountSuspended(AppInput)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('renders label when provided', async () => {
    const wrapper = await mountSuspended(AppInput, {
      props: { label: 'Email', id: 'email' },
    })
    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe('email')
  })

  it('does not render label when not provided', async () => {
    const wrapper = await mountSuspended(AppInput)
    expect(wrapper.find('label').exists()).toBe(false)
  })

  it('binds id to input', async () => {
    const wrapper = await mountSuspended(AppInput, {
      props: { id: 'name' },
    })
    expect(wrapper.find('input').attributes('id')).toBe('name')
  })

  it('reflects modelValue in input', async () => {
    const wrapper = await mountSuspended(AppInput, {
      props: { modelValue: 'hello' },
    })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = await mountSuspended(AppInput)
    const input = wrapper.find('input')
    await input.setValue('typed')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['typed'])
  })

  it('passes through native attrs to input', async () => {
    const wrapper = await mountSuspended(AppInput, {
      attrs: { placeholder: 'Enter email', type: 'email' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Enter email')
    expect(input.attributes('type')).toBe('email')
  })
})
