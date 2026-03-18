import Image from 'next/image'

export default function BrandStorySection() {
  return (
    <section className='mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 pb-14 pt-6 md:grid-cols-2 md:gap-10 md:pb-20'>
      <div className='relative overflow-hidden rounded-2xl bg-zinc-100 shadow-sm'>
        <div className='relative aspect-4/3 w-full'>
          <Image
            src='https://picsum.photos/seed/brand-story/1200/900'
            alt='Brand story visual'
            fill
            sizes='(max-width: 768px) 100vw, 50vw'
            className='object-cover'
          />
        </div>
      </div>

      <div className='space-y-4 md:space-y-5'>
        <p className='text-sm font-semibold tracking-[0.2em] text-zinc-500'>OUR STORY</p>
        <h2 className='text-2xl font-bold text-zinc-900 sm:text-3xl'>為日常而生，讓選物更有溫度</h2>
        <p className='text-base leading-7 text-zinc-600'>
          我們相信每一件商品都該同時具備實用性與設計感。從材質、工藝到使用情境，
          我們持續挑選真正適合日常生活的品項，讓你在每一次選購時，都能更快找到值得長期使用的好物。
        </p>
        <p className='text-base leading-7 text-zinc-600'>
          不追求短暫流行，而是專注於穩定品質與清楚的產品資訊，
          這是我們打造電商體驗的核心，也是我們對每一位顧客最基本的承諾。
        </p>
      </div>
    </section>
  )
}
