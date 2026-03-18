import { cn } from '@/lib/utils'

type PaymentProgressStepsProps = {
  currentStep: number
  steps?: string[]
}

const defaultSteps = ['填寫資訊', '確認資訊', '付款']

export default function PaymentProgressSteps({ currentStep, steps = defaultSteps }: PaymentProgressStepsProps) {
  return (
    <ol className='mb-6 flex sm:mb-8'>
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isDone = stepNumber < currentStep
        const hasNext = index < steps.length - 1

        return (
          <li
            key={label}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-2 text-center',
              hasNext &&
                "after:absolute after:left-[calc(50%+1rem)] after:right-[calc(-50%+1rem)] after:top-3.5 after:h-px after:content-['']",
              hasNext && isDone && 'after:bg-zinc-900',
              hasNext && !isDone && 'after:bg-zinc-300'
            )}
          >
            <span
              className={cn(
                'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                isActive && 'border-zinc-900 bg-zinc-900 text-white',
                isDone && 'border-zinc-900 bg-zinc-100 text-zinc-900',
                !isActive && !isDone && 'border-zinc-300 bg-white text-zinc-500'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {stepNumber}
            </span>
            <span
              className={cn(
                'max-w-full truncate px-1 text-sm',
                isActive && 'font-semibold text-zinc-900',
                isDone && 'text-zinc-700',
                !isActive && !isDone && 'text-zinc-500'
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
