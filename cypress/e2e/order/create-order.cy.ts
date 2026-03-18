import { CART_STORAGE_KEY } from '../../../shared/hooks/useCart'
import { CHECKOUT_INFO_STORAGE_KEY } from '../../../shared/hooks/useCheckoutInfo'

describe('Create an order', () => {
  const cartItem = {
    id: 'P-0001',
    name: 'Nova Bottle 01',
    image: 'https://picsum.photos/seed/P-0001/640/640',
    price: 120,
    originalPrice: 120,
    quantity: 2
  }

  beforeEach(() => {
    // 模擬購物車寫進 localStorage (也可以從商品詳細頁到購物車)
    cy.window().then((win) => {
      win.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items: [cartItem] }, version: 0 }))
    })
  })

  afterEach(() => {
    cy.window().then((win) => {
      win.localStorage.removeItem(CART_STORAGE_KEY)
      win.localStorage.removeItem(CHECKOUT_INFO_STORAGE_KEY)
    })
  })

  it('completes full checkout flow and lands on order complete page', () => {
    cy.visit('http://localhost:3000/checkout')

    // 填寫 付款資訊
    cy.get('#email').type('test@example.com')
    cy.get('#name').type('王小明')
    cy.get('input[name="phoneNumber"]').type('912345678')
    cy.get('#address').type('台北市信義區信義路五段7號')
    cy.get('#paymentMethod').select('credit-card')

    cy.contains('Nova Bottle 01').should('be.visible')
    cy.contains('數量：2').should('be.visible')
    cy.contains('button', '下一步').click()

    // 確認 付款資訊 與 購物車內容
    cy.contains('確認送出', { timeout: 10000 }).should('be.visible')

    cy.contains('test@example.com').should('be.visible')
    cy.contains('王小明').should('be.visible')
    cy.contains('台北市信義區信義路五段7號').should('be.visible')
    cy.contains('信用卡').should('be.visible')

    cy.contains('button', '確認送出').click() // 送出 postOrder

    // 完成後到 complete page
    cy.url({ timeout: 15000 }).should('include', '/order/complete')
    cy.url().should('not.include', 'email=')

    cy.contains('付款成功').should('be.visible')
    cy.contains('感謝您的訂購').should('be.visible')
    cy.contains('訂單編號').should('be.visible')
  })

  it('shows error when cart is empty and prevents proceeding', () => {
    // 清掉購物車的東西
    cy.window().then((win) => {
      win.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items: [] }, version: 0 }))
    })

    cy.visit('http://localhost:3000/checkout')

    cy.contains('button', '下一步').should('be.disabled')
  })

  it('shows cart validation notice when cart has an invalid item', () => {
    // Intercept: Spy and stub network requests and responses.

    cy.intercept('POST', '/api/order/validateCart', {
      statusCode: 200,
      body: {
        isValid: false,
        items: [
          {
            id: 'P-0001',
            name: 'Nova Bottle 01',
            status: 'INSUFFICIENT_STOCK',
            messages: ['庫存不足']
          }
        ]
      }
    }).as('validateCart')
    // before page visit

    cy.visit('http://localhost:3000/checkout')

    cy.get('#email').type('test@example.com')
    cy.get('#name').type('王小明')
    cy.get('input[name="phoneNumber"]').type('912345678')
    cy.get('#address').type('台北市信義區信義路五段7號')
    cy.get('#paymentMethod').select('credit-card')

    cy.contains('button', '下一步').click()
    cy.wait('@validateCart')

    cy.contains('button', '下一步').should('be.visible')

    // ValidationNotice should appear with correct content
    cy.contains('購物車內容需要更新後才能繼續結帳').should('be.visible')
    cy.contains('Nova Bottle 01').should('be.visible')
    cy.contains('庫存不足').should('be.visible')
    cy.contains('請回購物車調整商品後再重新驗證。').should('be.visible')
  })
})
