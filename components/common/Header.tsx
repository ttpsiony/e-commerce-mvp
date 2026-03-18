'use client'

import Image from 'next/image'
import Link from 'next/link'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as DropdownItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdownMenu'
import {
  NavigationMenuContent,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigationMenu'
import { useCart } from '@/shared/hooks/useCart'
import { formatCurrency } from '@/shared/utils/currency'

const navItems = [
  { label: '訂單查詢', href: '/order/lookup' },
  { label: '關於我們', href: '/' }
]

const featuredTags = ['ELECTRONICS', 'FASHION', 'HOME', 'SPORTS']
export default function Header() {
  const { items, totalCount } = useCart()

  return (
    <header className='w-full border-b border-zinc-200 bg-white/90 backdrop-blur-sm'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4'>
        <div className='flex items-center gap-4'>
          <Link
            href='/'
            className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50'
            aria-label='回到首頁'
          >
            <Image src='/vercel.svg' alt='Vercel logo' width={20} height={16} priority />
          </Link>

          <NavigationMenu viewport={false} className='hidden md:flex'>
            <NavigationMenuList className='justify-start gap-3'>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className='px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-transparent hover:text-black'
                >
                  <Link href='/products'>商品列表</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className='h-auto bg-transparent px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-transparent hover:text-black focus:bg-transparent focus:text-black data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent'>
                  特色商品
                </NavigationMenuTrigger>
                <NavigationMenuContent className='min-w-40 p-1'>
                  <ul className='grid gap-1'>
                    {featuredTags.map((tag) => (
                      <Link
                        key={tag}
                        className='px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-black'
                        href='/'
                      >
                        {tag}
                      </Link>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {navItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    asChild
                    className='px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-transparent hover:text-black'
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className='flex items-center justify-end gap-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='rounded-md p-1 outline-none transition hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-black/50'
                aria-label='購物車'
              >
                <div className='relative'>
                  <Image src='/cart.png' alt='購物車' width={24} height={24} />
                  {totalCount > 0 ? (
                    <span className='absolute -top-2 -right-2 inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] leading-5 text-white'>
                      {totalCount}
                    </span>
                  ) : null}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
              <DropdownMenuLabel>購物車</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {items.length === 0 ? (
                <div className='px-2 py-6 text-center text-sm text-zinc-500'>目前購物車是空的</div>
              ) : (
                <div className='max-h-55 overflow-y-auto'>
                  {items.map((item) => (
                    <DropdownItem key={item.id} className='flex items-center justify-between gap-2'>
                      <span className='line-clamp-1'>{item.name}</span>
                      <span className='text-xs text-zinc-500'>
                        x{item.quantity} / {formatCurrency(item.price)}
                      </span>
                    </DropdownItem>
                  ))}
                </div>
              )}
              {items.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <div className='px-2 pb-1'>
                    <Button asChild className='h-8 w-full text-xs'>
                      <Link href='/cart'>前往確認</Link>
                    </Button>
                  </div>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <LanguageSwitcher triggerVariant='icon' />
        </div>
      </div>
    </header>
  )
}
