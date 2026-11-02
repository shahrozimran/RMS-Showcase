export const demoMenu = [
  { id: 'burger', name: 'House burger', description: 'Grilled beef, cheddar & house sauce', price: 1499, category: 'Mains' },
  { id: 'salad', name: 'Garden bowl', description: 'Seasonal greens, avocado & seeds', price: 1199, category: 'Mains' },
  { id: 'lemonade', name: 'Fresh lemonade', description: 'Lemon, garden mint & a little sunshine', price: 349, category: 'Drinks' },
] as const

export type DemoProductId = (typeof demoMenu)[number]['id']
export type DemoCart = Record<DemoProductId, number>
export const initialCart: DemoCart = { burger: 1, salad: 0, lemonade: 1 }
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

export function orderTotals(cart: DemoCart) {
  const lines = demoMenu.filter(p => cart[p.id] > 0).map(product => ({
    ...product, quantity: cart[product.id], amount: product.price * cart[product.id],
    tax: Math.round(product.price * cart[product.id] * 0.05),
  }))
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0)
  const tax = lines.reduce((sum, line) => sum + line.tax, 0)
  return { lines, subtotal, tax, total: subtotal + tax, count: lines.reduce((sum, line) => sum + line.quantity, 0) }
}

export const workflow = [
  { title: 'The guest orders', short: 'Order', label: 'At the table', heading: 'A great meal starts with a simple scan.', text: 'Your guest scans the table’s QR code, explores the menu and sends an order. No app download. No guest account.', action: 'Place sample order' },
  { title: 'Your team confirms', short: 'Confirm', label: 'On the floor', heading: 'A little human touch. A lot more clarity.', text: 'A team member reviews the incoming request and confirms it. The table, items and preparation notes stay together.', action: 'Confirm & send to kitchen' },
  { title: 'The kitchen gets a ticket', short: 'Prepare', label: 'In the kitchen', heading: 'The right details, without the rewrite.', text: 'A clear kitchen ticket is ready to print, with item quantities and notes. Your team can get straight to preparing the order.', action: 'Continue to the bill' },
  { title: 'The bill gets settled', short: 'Settle', label: 'At checkout', heading: 'Finish the meal on a good note.', text: 'Review the total, record the guest’s payment and issue a receipt. RMS keeps the order and its payment record together.', action: 'Complete sample checkout' },
  { title: 'You see the bigger picture', short: 'Understand', label: 'For the owner', heading: 'One service. A clearer picture.', text: 'Completed sales, open orders and team activity come together in the admin workspace, so you can see how your restaurant is doing.', action: 'Get a personal walkthrough' },
] as const
