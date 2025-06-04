
  class SiteSearch extends HTMLElement {
    constructor() {
      super()
      const openBtn = this.querySelector<HTMLButtonElement>('button[data-open-modal]')
      const closeBtn = this.querySelector<HTMLButtonElement>('button[data-close-modal]')
      const dialog = this.querySelector('dialog')
      const dialogFrame = this.querySelector('.dialog-frame')
      if (!openBtn || !closeBtn || !dialog || !dialogFrame) return

      /** Close the modal if a user clicks on a link or outside of the modal. */
      const onClick = (event: MouseEvent) => {
        const isLink = 'href' in (event.target || {})
        if (isLink || (document.body.contains(event.target as Node) && !dialogFrame.contains(event.target as Node))) {
          closeModal()
        }
      }

      const openModal = (event?: MouseEvent) => {
        dialog.showModal()
        document.body.toggleAttribute('data-search-modal-open', true)
        this.querySelector('input')?.focus()
        event?.stopPropagation()
        globalThis.addEventListener('click', onClick)
      }

      const closeModal = () => dialog.close()

      openBtn.addEventListener('click', openModal)
      openBtn.disabled = false
      closeBtn.addEventListener('click', closeModal)

      dialog.addEventListener('close', () => {
        document.body.toggleAttribute('data-search-modal-open', false)
        globalThis.removeEventListener('click', onClick)
      })

      // Listen for `ctrl + k` and `cmd + k` keyboard shortcuts.
      globalThis.addEventListener('keydown', (e) => {
        if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'k') {
          if (dialog.open) {
            closeModal()
          } else {
            openModal()
          }
          e.preventDefault()
        }
      })

      let translations = {}
      try {
        translations = JSON.parse(this.dataset['translations'] || '{}')
      } catch {
        // Ignore translation parsing errors.
      }

      const shouldStrip = this.dataset['stripTrailingSlash'] !== undefined
      const formatURL = shouldStrip ? this.stripTrailingSlash : (path: string) => path
      const version = this.dataset['version'] ?? 'current'

      globalThis.addEventListener('DOMContentLoaded', () => {
        if (import.meta.env.DEV) return
        const onIdle = globalThis.requestIdleCallback || ((cb) => setTimeout(cb, 1))
        onIdle(async () => {
          // @ts-expect-error — Missing types for @pagefind/default-ui package.
          const { PagefindUI } = await import('@pagefind/default-ui')
          const search = new PagefindUI({
            element: '#starlight__search',
            baseUrl: import.meta.env.BASE_URL,
            bundlePath: `${import.meta.env.BASE_URL.replace(/\/$/, '')}/pagefind/`,
            showImages: false,
            translations,
            showSubResults: true,
            processResult: (result: { url: string; sub_results: { url: string }[] }) => {
              result.url = formatURL(result.url)
              result.sub_results = result.sub_results.map((sub_result) => {
                sub_result.url = formatURL(sub_result.url)
                return sub_result
              })
            },
          })
          search.triggerFilters({ version: [version] })
        })
      })
    }

    private stripTrailingSlash(path: string) {
      return path.replace(/(.)\/(#.*)?$/, '$1$2')
    }
  }
  customElements.define('site-search', SiteSearch)

  import { navigate } from 'astro:transitions/client'

  const handleNewVersion = (href: string | null) => {
    if (href) {
      document.cookie = 'selectedVersion=current; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      navigate(href)
    }
  }

  document.addEventListener('astro:page-load', () => {
    const link = document.getElementById('version-switch-link')
    if (link) {
      const href = link.getAttribute('href')
      link.removeEventListener('click', () => handleNewVersion(href))
      link.addEventListener('click', () => {
        handleNewVersion(href)
      })
    }
  })