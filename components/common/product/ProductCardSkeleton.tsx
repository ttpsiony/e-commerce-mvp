import { Skeleton } from '@/components/ui/skeleton'

export default function ProductCardSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border border-zinc-200 bg-white p-4'>
      <Skeleton className='aspect-square w-full rounded-lg' />
      <div className='mt-4 space-y-3'>
        <Skeleton className='h-5 w-2/3' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
        <Skeleton className='h-5 w-1/3' />
      </div>
    </div>
  )
}
