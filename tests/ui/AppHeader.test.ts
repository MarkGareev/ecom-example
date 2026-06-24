import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRouter } from '#app'
import AppHeader from '~/widgets/header/AppHeader.vue'

describe('AppHeader — search', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the search input', async () => {
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
  })

  it('navigates to /catalog?q= on Enter with a non-empty query', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const router = useRouter()
    const push = vi.spyOn(router, 'push')

    const input = wrapper.find('input[type="search"]')
    await input.setValue('mug')
    await input.trigger('keydown.enter')

    expect(push).toHaveBeenCalledWith({ path: '/catalog', query: { q: 'mug' } })
    push.mockRestore()
  })

  it('trims whitespace before navigating', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const router = useRouter()
    const push = vi.spyOn(router, 'push')

    const input = wrapper.find('input[type="search"]')
    await input.setValue('  bowl  ')
    await input.trigger('keydown.enter')

    expect(push).toHaveBeenCalledWith({ path: '/catalog', query: { q: 'bowl' } })
    push.mockRestore()
  })

  it('navigates to /catalog without query when input is empty', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const router = useRouter()
    const push = vi.spyOn(router, 'push')

    const input = wrapper.find('input[type="search"]')
    await input.setValue('')
    await input.trigger('keydown.enter')

    expect(push).toHaveBeenCalledWith('/catalog')
    push.mockRestore()
  })

  it('navigates to /catalog without query when input is only whitespace', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const router = useRouter()
    const push = vi.spyOn(router, 'push')

    const input = wrapper.find('input[type="search"]')
    await input.setValue('   ')
    await input.trigger('keydown.enter')

    expect(push).toHaveBeenCalledWith('/catalog')
    push.mockRestore()
  })
})
