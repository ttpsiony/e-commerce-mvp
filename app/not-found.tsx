import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <section className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center px-4 py-16'>
      <div className='space-y-4 text-center'>
        <p className='text-sm font-semibold tracking-widest text-zinc-500'>404 NOT FOUND</p>
        <h1 className='text-3xl font-bold text-zinc-900 sm:text-4xl'>找不到這個頁面</h1>
        <p className='text-zinc-600'>你要前往的內容可能已移動、刪除，或網址輸入錯誤。</p>
        <div className='pt-2'>
          <Button asChild>
            <Link href='/'>回首頁</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
