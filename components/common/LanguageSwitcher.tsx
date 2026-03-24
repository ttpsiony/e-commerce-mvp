'use client'

import * as React from 'react'
import { useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdownMenu'
import { cn } from '@/lib/utils'
import { languageOptions } from '@/shared/constants'

type LanguageSwitcherProps = {
  defaultLanguage?: string
  align?: 'start' | 'center' | 'end'
  triggerVariant?: 'button' | 'icon'
}

export default function LanguageSwitcher({
  defaultLanguage = 'zh-TW',
  align = 'end',
  triggerVariant = 'button'
}: LanguageSwitcherProps) {
  const [language, setLanguage] = React.useState(defaultLanguage)
  const [hoveredLanguage, setHoveredLanguage] = React.useState<string | null>(null)
  const currentLabel = useMemo(() => languageOptions.find((item) => item.value === language)?.label, [language])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerVariant === 'icon' ? (
          <button
            type='button'
            className='rounded-md p-1 outline-none transition hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-black/50'
            aria-label='語系切換'
          >
            <Image src='/language.png' alt='語系切換' width={24} height={24} />
          </button>
        ) : (
          <Button variant='outline'>語系：{currentLabel}</Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className='w-40'>
        <DropdownMenuLabel>語系切換</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languageOptions.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => {
              setLanguage(item.value)
              setHoveredLanguage(null)
            }}
            onPointerEnter={() => setHoveredLanguage(item.value)}
            onFocus={() => setHoveredLanguage(item.value)}
            className={cn(
              item.value === language && hoveredLanguage === null ? 'bg-accent text-accent-foreground' : undefined
            )}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
